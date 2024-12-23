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
        LEFT JOIN visiting v ON v.patient_id_patient = p.id_patient 
            AND v.doctor_id_doc = t.doctor_id_doc 
            AND DATE(v.date) = DATE(t.admission)
        WHERE t.doctor_id_doc = %s
        ORDER BY t.admission DESC, t.time DESC
    """
    
    result = current_app.config['sql_provider'].execute_query(appointments_query, (doctor_id,))
    
    appointments = []
    for row in result:
        seconds = int(row['time'].total_seconds())
        time_str = f"{seconds // 3600:02d}:{(seconds % 3600) // 60:02d}"
        
        # Получаем текущую ��ату и время в московском часовом поясе
        now = datetime.now(MSK)
        
        # Преобразуем timedelta в time для корректного сравнения
        time_obj = (datetime.min + row['time']).time()
        
        # Создаем datetime для сравнения в московском часовом поясе
        appointment_datetime = datetime.combine(row['date'], time_obj).replace(tzinfo=MSK)
        
        # Добавляем отладочную информацию
        print(f"Moscow time now: {now}")
        print(f"Appointment time (MSK): {appointment_datetime}")
        print(f"Date comparison: {row['date']} vs {now.date()}")
        print(f"Time comparison: {time_obj} vs {now.time()}")
        
        # Проверяем, прошло ли время приема
        is_past = False
        if row['date'] < now.date():
            is_past = True
        elif row['date'] == now.date():
            is_past = time_obj < now.time()
        
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

@doctor_bp.route('/api/doctor/diagnosis', methods=['POST'])
@login_required
@role_required(['doctor'])
def add_diagnosis():
    data = request.get_json()
    
    if not all(key in data for key in ['patient_id', 'diagnosis', 'complaints']):
        return jsonify({'error': 'Не все поля заполнены'}), 400
    
    # Получаем id врача
    doctor_query = "SELECT id_doc FROM doctor WHERE user_id = %s"
    doctor_result = current_app.config['sql_provider'].execute_query(doctor_query, (request.user_id,))
    
    if not doctor_result:
        return jsonify({'error': 'Врач не найден'}), 404
    
    doctor_id = doctor_result[0]['id_doc']
    
    # Добавляем запись в таблицу visiting, используя московское время
    insert_query = """
        INSERT INTO visiting 
        (patient_id_patient, date, diagnosis, complaints, doctor_id_doc)
        VALUES (%s, CURDATE(), %s, %s, %s)
    """
    
    try:
        current_app.config['sql_provider'].execute_query(
            insert_query,
            (
                data['patient_id'],
                data['diagnosis'],
                data['complaints'],
                doctor_id
            )
        )
        return jsonify({'message': 'Диагноз успешно добавлен'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500