from flask import Blueprint, jsonify, current_app
from datetime import datetime, timedelta

schedule_bp = Blueprint('schedule', __name__)

@schedule_bp.route('/api/schedule/doctors', methods=['GET'])
def get_doctors_schedule():
    query = current_app.config['sql_provider'].get_query('schedule/get_doctors_schedule.sql')
    result = current_app.config['sql_provider'].execute_query(query)
    
    # Преобразуем результат в нужный формат
    doctors = {}
    for row in result:
        doctor_id = row['id_doc']
        if doctor_id not in doctors:
            doctors[doctor_id] = {
                'id_doc': doctor_id,
                'full_name': row['full_name'],
                'schedule': {}
            }
        if row['day_of_week']:
            start_seconds = int(row['start_time'].total_seconds())
            end_seconds = int(row['end_time'].total_seconds())
            
            start_time = f"{start_seconds // 3600:02d}:{(start_seconds % 3600) // 60:02d}"
            end_time = f"{end_seconds // 3600:02d}:{(end_seconds % 3600) // 60:02d}"
            
            doctors[doctor_id]['schedule'][row['day_of_week']] = {
                'start_time': start_time,
                'end_time': end_time,
                'cabinet': row['cabinet']
            }
    
    response = jsonify(list(doctors.values()))
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    return response 

@schedule_bp.route('/api/schedule/departments', methods=['GET'])
def get_departments():
    query = current_app.config['sql_provider'].get_query('schedule/get_departments.sql')
    result = current_app.config['sql_provider'].execute_query(query)
    return jsonify(result)

@schedule_bp.route('/api/schedule/doctors/<int:department_id>', methods=['GET'])
def get_doctors_by_department(department_id):
    query = current_app.config['sql_provider'].get_query('schedule/get_doctors_by_department.sql')
    result = current_app.config['sql_provider'].execute_query(query, (department_id,))
    
    doctors = {}
    for row in result:
        doctor_id = row['id_doc']
        if doctor_id not in doctors:
            doctors[doctor_id] = {
                'id_doc': doctor_id,
                'full_name': row['full_name'],
                'schedule': {}
            }
        if row['day_of_week']:
            start_seconds = int(row['start_time'].total_seconds())
            end_seconds = int(row['end_time'].total_seconds())
            
            start_time = f"{start_seconds // 3600:02d}:{(start_seconds % 3600) // 60:02d}"
            end_time = f"{end_seconds // 3600:02d}:{(end_seconds % 3600) // 60:02d}"
            
            doctors[doctor_id]['schedule'][row['day_of_week']] = {
                'start_time': start_time,
                'end_time': end_time,
                'cabinet': row['cabinet']
            }
    
    response = jsonify(list(doctors.values()))
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    return response