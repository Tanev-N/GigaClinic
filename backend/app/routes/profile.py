from flask import Blueprint, request, jsonify, current_app
from .auth import login_required

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/api/profile/patient', methods=['GET'])
@login_required
def get_patient_data():
    query = """
    SELECT p.*, u.login
    FROM patient p
    JOIN user u ON p.user_id = u.id_user
    WHERE u.id_user = %s
    """
    result = current_app.config['sql_provider'].execute_query(query, (request.user_id,))
    
    if not result:
        return jsonify({'error': 'Пациент не найден'}), 404
        
    return jsonify(result[0])

@profile_bp.route('/api/profile/patient', methods=['PUT'])
@login_required
def update_patient_data():
    data = request.get_json()
    
    if not all(key in data for key in ['passport_data', 'address', 'birth']):
        return jsonify({'error': 'Не все поля заполнены'}), 400
    
    query = """
    UPDATE patient 
    SET passport_data = %s, address = %s, birth = %s
    WHERE user_id = %s
    """
    
    try:
        current_app.config['sql_provider'].execute_query(
            query, 
            (data['passport_data'], data['address'], data['birth'], request.user_id)
        )
        return jsonify({'message': 'Данные успешно обновлены'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500 

@profile_bp.route('/api/profile/appointments', methods=['GET'])
@login_required
def get_user_appointments():
    query = """
    SELECT 
        t.id_tit as id,
        t.admission as date,
        TIME_FORMAT(t.time, '%H:%i') as time,
        t.appearance,
        d.full_name as doctor_name,
        c.type as cabinet_type,
        c.id_cab as cabinet_number,
        v.diagnosis,
        v.complaints,
        v.id_vis as visit_id
    FROM timetable t
    JOIN doctor d ON t.doctor_id_doc = d.id_doc
    JOIN cabinet c ON t.cabinet_id_cab = c.id_cab
    JOIN patient p ON t.patient_id_patient = p.id_patient
    LEFT JOIN visiting v ON v.timetable_id = t.id_tit
    WHERE p.user_id = %s
    ORDER BY t.admission DESC, t.time DESC
    """
    
    result = current_app.config['sql_provider'].execute_query(query, (request.user_id,))
    
    appointments = []
    for row in result:
        appointments.append({
            'id': row['id'],
            'date': row['date'].strftime('%Y-%m-%d'),
            'time': row['time'],
            'doctor_name': row['doctor_name'],
            'cabinet': f"Кабинет №{row['cabinet_number']} ({row['cabinet_type']})",
            'appearance': row['appearance'],
            'visit_id': row['visit_id'],
            'diagnosis': row['diagnosis'],
            'complaints': row['complaints']
        })
    
    return jsonify(appointments)

@profile_bp.route('/api/profile/appointments/<int:appointment_id>', methods=['DELETE'])
@login_required
def delete_appointment(appointment_id):
    query = current_app.config['sql_provider'].get_query('profile/delete_appointment.sql')
    try:
        affected_rows = current_app.config['sql_provider'].execute_query(
            query, 
            (appointment_id, request.user_id,)
        )
        if affected_rows > 0:
            return jsonify({'message': 'Запись успешно удалена'})
        return jsonify({'error': 'Запись не найдена или нет прав для её удаления'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/api/profile/doctor', methods=['GET'])
@login_required
def get_doctor_data():
    query = """
    SELECT 
        d.*,
        u.login,
        dep.name as department_name
    FROM doctor d
    JOIN user u ON d.user_id = u.id_user
    JOIN department dep ON d.department_id_dep = dep.id_dep
    WHERE u.id_user = %s
    """
    result = current_app.config['sql_provider'].execute_query(query, (request.user_id,))
    
    if not result:
        return jsonify({'error': 'Врач не найден'}), 404
        
    doctor_data = result[0]
    
    # Получаем расписание врача
    schedule_query = """
    SELECT 
        day_of_week,
        start_time,
        end_time,
        cabinet
    FROM doctor_schedule
    WHERE doctor_id = %s
    ORDER BY day_of_week
    """
    schedule_result = current_app.config['sql_provider'].execute_query(schedule_query, (doctor_data['id_doc'],))
    
    # Форматируем расписание
    schedule = []
    for row in schedule_result:
        start_seconds = int(row['start_time'].total_seconds())
        end_seconds = int(row['end_time'].total_seconds())
        
        schedule.append({
            'day_of_week': row['day_of_week'],
            'start_time': f"{start_seconds // 3600:02d}:{(start_seconds % 3600) // 60:02d}",
            'end_time': f"{end_seconds // 3600:02d}:{(end_seconds % 3600) // 60:02d}",
            'cabinet': row['cabinet']
        })
    
    # Добавляем расписание �� данным врача
    doctor_data['schedule'] = schedule
    
    # Форматируем даты для фронтенда
    doctor_data['birth'] = doctor_data['birth'].strftime('%Y-%m-%d')
    doctor_data['employment'] = doctor_data['employment'].strftime('%Y-%m-%d')
    if doctor_data['dismissal']:
        doctor_data['dismissal'] = doctor_data['dismissal'].strftime('%Y-%m-%d')
        
    return jsonify(doctor_data)