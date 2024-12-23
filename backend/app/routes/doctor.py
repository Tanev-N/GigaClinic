from flask import Blueprint, request, jsonify, current_app
from .auth import login_required, role_required
from datetime import datetime, timedelta, timezone

doctor_bp = Blueprint('doctor', __name__)

# Создаем часовой пояс Москвы (UTC+3)
MSK = timezone(timedelta(hours=3))

@doctor_bp.route('/api/doctor/appointments', methods=['GET'])
@login_required
@role_required(['doctor'])
def get_doctor_appointments():
    print(f"User ID: {request.user_id}")
    
    # Получаем id врача по user_id
    doctor_query = """
        SELECT id_doc 
        FROM doctor 
        WHERE user_id = %s
    """
    doctor_result = current_app.config['sql_provider'].execute_query(doctor_query, (request.user_id,))
    
    if not doctor_result:
        return jsonify({'error': 'Врач не найден'}), 404
    
    doctor_id = doctor_result[0]['id_doc']
    
    # Получаем все записи к врачу
    appointments_query = """
        SELECT 
            t.id_tit as id,
            t.admission as date,
            TIME_FORMAT(t.time, '%H:%i') as time_str,
            t.time,
            t.appearance,
            p.passport_data,
            CONCAT(
                TIMESTAMPDIFF(YEAR, p.birth, CURDATE()),
                ' лет'
            ) as age,
            t.patient_id_patient,
            c.type as cabinet_type,
            c.id_cab as cabinet_number,
            v.id_vis as visit_id,
            v.diagnosis,
            v.complaints
        FROM timetable t
        JOIN patient p ON t.patient_id_patient = p.id_patient
        JOIN cabinet c ON t.cabinet_id_cab = c.id_cab
        LEFT JOIN visiting v ON v.timetable_id = t.id_tit
        WHERE t.doctor_id_doc = %s
        ORDER BY t.admission DESC, t.time DESC
    """
    
    result = current_app.config['sql_provider'].execute_query(appointments_query, (doctor_id,))
    
    appointments = []
    for row in result:
        # Получаем текущую дату и время в московском часовом поясе
        now = datetime.now(MSK)
        
        # Преобразуем строку времени в объект time
        time_str = row['time_str']
        
        # Создаем datetime для сравнения в московском часовом поясе
        appointment_datetime = datetime.combine(
            row['date'], 
            datetime.strptime(time_str, '%H:%M').time()
        ).replace(tzinfo=MSK)
        
        # Проверяем, прошло ли время приема
        is_past = appointment_datetime < now
        
        appointments.append({
            'id': row['id'],
            'date': row['date'].strftime('%Y-%m-%d'),
            'time': time_str,
            'patient_id': row['patient_id_patient'],
            'passport_data': row['passport_data'],
            'age': row['age'],
            'cabinet': f"Кабинет №{row['cabinet_number']} ({row['cabinet_type']})",
            'appearance': row['appearance'],
            'is_past': is_past,
            'visit_id': row['visit_id'],
            'diagnosis': row['diagnosis'],
            'complaints': row['complaints']
        })
    
    return jsonify(appointments)

@doctor_bp.route('/api/doctor/add-diagnosis', methods=['POST'])
@login_required
@role_required(['doctor'])
def add_diagnosis():
    data = request.get_json()
    
    if not all(key in data for key in ['appointment_id', 'diagnosis', 'complaints']):
        return jsonify({'error': 'Не все параметры указаны'}), 400

    # Проверяем, существует ли запись и принадлежит ли она этому врачу
    check_query = """
    SELECT t.*, d.id_doc
    FROM timetable t
    JOIN doctor d ON d.id_doc = t.doctor_id_doc
    WHERE t.id_tit = %s AND d.user_id = %s
    """
    appointment = current_app.config['sql_provider'].execute_query(
        check_query, 
        (data['appointment_id'], request.user_id)
    )

    if not appointment:
        return jsonify({'error': 'Запись не найдена или у вас нет прав для ее изменения'}), 404

    # Проверяем, не был ли уже добавлен диагноз
    check_visit_query = """
    SELECT id_vis
    FROM visiting
    WHERE timetable_id = %s
    """
    existing_visit = current_app.config['sql_provider'].execute_query(
        check_visit_query,
        (data['appointment_id'],)
    )

    if existing_visit:
        return jsonify({'error': 'Диагноз для этой записи уже добавлен'}), 400

    # Добавляем диагноз
    insert_query = """
    INSERT INTO visiting (
        patient_id_patient,
        doctor_id_doc,
        date,
        time,
        diagnosis,
        complaints,
        timetable_id
    ) VALUES (
        %s, %s, %s, 
        (SELECT time FROM timetable WHERE id_tit = %s),
        %s, %s, %s
    )
    """
    
    try:
        current_app.config['sql_provider'].execute_query(
            insert_query,
            (
                appointment[0]['patient_id_patient'],
                appointment[0]['doctor_id_doc'],
                appointment[0]['admission'],
                data['appointment_id'],
                data['diagnosis'],
                data['complaints'],
                data['appointment_id']
            )
        )
        return jsonify({'message': 'Диагноз успешно добавлен'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500