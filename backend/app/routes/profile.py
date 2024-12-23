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
    query = current_app.config['sql_provider'].get_query('profile/get_user_appointments.sql')
    result = current_app.config['sql_provider'].execute_query(query, (request.user_id,))
    
    appointments = []
    for row in result:
        seconds = int(row['time'].total_seconds())
        time_str = f"{seconds // 3600:02d}:{(seconds % 3600) // 60:02d}"

        appointments.append({
            'id': row['id'],
            'date': row['date'].strftime('%Y-%m-%d'),
            'time': time_str,
            'doctor_name': row['doctor_name'],
            'cabinet': f"Кабинет №{row['cabinet_number']} ({row['cabinet_type']})",
            'appearance': row['appearance']
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