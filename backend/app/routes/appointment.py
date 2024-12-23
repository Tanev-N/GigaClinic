from flask import Blueprint, jsonify, request, current_app
from .auth import login_required
from datetime import datetime, timedelta

appointment_bp = Blueprint('appointment', __name__)

@appointment_bp.route('/api/appointment/available-slots', methods=['GET'])
@login_required
def get_available_slots():
    doctor_id = request.args.get('doctor_id')
    date = request.args.get('date')
    
    if not doctor_id or not date:
        return jsonify({'error': 'Не указан врач или дата'}), 400
    
    # Получаем расписание врача на этот день недели
    schedule_query = current_app.config['sql_provider'].get_query('appointment/get_doctor_schedule.sql')
    schedule = current_app.config['sql_provider'].execute_query(
        schedule_query, 
        (doctor_id, datetime.strptime(date, '%Y-%m-%d').weekday() + 1)
    )
    
    if not schedule:
        return jsonify({'error': 'В этот день врач не принимает'}), 404
    
    # Получаем уже занятые слоты
    appointments_query = current_app.config['sql_provider'].get_query('appointment/get_doctor_appointments.sql')
    appointments = current_app.config['sql_provider'].execute_query(
        appointments_query,
        (doctor_id, date)
    )
    
    # Конвертируем занятые слоты в строки времени
    busy_times = set()
    for app in appointments:
        seconds = int(app['appointment_time'].total_seconds())
        time_str = f"{seconds // 3600:02d}:{(seconds % 3600) // 60:02d}"
        busy_times.add(time_str)
    
    # Формируем доступные временные слоты
    start_seconds = int(schedule[0]['start_time'].total_seconds())
    end_seconds = int(schedule[0]['end_time'].total_seconds())
    
    start_time = datetime.strptime(f"{start_seconds // 3600:02d}:{(start_seconds % 3600) // 60:02d}", '%H:%M')
    end_time = datetime.strptime(f"{end_seconds // 3600:02d}:{(end_seconds % 3600) // 60:02d}", '%H:%M')
    slot = start_time
    
    available_slots = []
    while slot < end_time:
        slot_str = slot.strftime('%H:%M')
        if slot_str not in busy_times:
            available_slots.append(slot_str)
        slot += timedelta(minutes=30)  # 30-минутные слоты
    
    return jsonify({
        'date': date,
        'doctor_id': doctor_id,
        'available_slots': available_slots
    })

@appointment_bp.route('/api/appointment/create', methods=['POST'])
@login_required
def create_appointment():
    data = request.get_json()
    
    if not all(key in data for key in ['doctor_id', 'date', 'time']):
        return jsonify({'error': 'Не все данные указаны'}), 400
    
    # Проверяем, свободно ли время
    check_query = current_app.config['sql_provider'].get_query('appointment/check_slot.sql')
    existing = current_app.config['sql_provider'].execute_query(
        check_query,
        (data['doctor_id'], data['date'], data['time'])
    )
    
    if existing:
        return jsonify({'error': 'Это время уже занято'}), 409
    
    # Получаем ID пациента по user_id
    patient_query = current_app.config['sql_provider'].get_query('appointment/get_patient_id.sql')
    patient = current_app.config['sql_provider'].execute_query(
        patient_query,
        (request.user_id,)
    )
    
    if not patient:
        return jsonify({'error': 'Пациент не найден'}), 404

    # Получаем ID кабинета
    cabinet_query = current_app.config['sql_provider'].get_query('appointment/get_cabinet_id.sql')
    cabinet = current_app.config['sql_provider'].execute_query(
        cabinet_query,
        (data['doctor_id'],)
    )

    if not cabinet:
        return jsonify({'error': 'Кабинет не найден'}), 404
    
    # Создаем запись
    insert_query = current_app.config['sql_provider'].get_query('appointment/create_appointment.sql')
    try:
        current_app.config['sql_provider'].execute_query(
            insert_query,
            (
                cabinet[0]['id_cab'],
                data['doctor_id'],
                patient[0]['id_patient'],
                data['date'],
                data['time']
            )
        )
        return jsonify({'message': 'Запись создана успешно'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@appointment_bp.route('/check-slots', methods=['GET'])
def check_slots():
    doctor_id = request.args.get('doctor_id')
    date = request.args.get('date')
    
    if not all([doctor_id, date]):
        return jsonify({'error': 'Не все параметры указаны'}), 400
        
    try:
        # Получаем расписание врача на этот день недели
        schedule_query = """
            SELECT * FROM doctor_schedule 
            WHERE doctor_id = %s AND day_of_week = WEEKDAY(%s) + 1
        """
        schedule = current_app.config['sql_provider'].execute_query(schedule_query, (doctor_id, date))
        
        if not schedule:
            return jsonify({'has_slots': False})
            
        # Получаем занятые слоты
        booked_slots_query = """
            SELECT time FROM timetable 
            WHERE doctor_id_doc = %s AND admission = %s
        """
        booked_slots = current_app.config['sql_provider'].execute_query(
            booked_slots_query, 
            (doctor_id, date)
        )
        
        # Если все слоты заняты
        if len(booked_slots) >= 8:  # Предполагаем максимум 8 слотов в день
            return jsonify({'has_slots': False})
            
        return jsonify({'has_slots': True})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500