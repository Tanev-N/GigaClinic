from flask import Blueprint, request, jsonify, current_app
from .auth import login_required, role_required

patient_bp = Blueprint('patient', __name__)

def has_access_to_patient_data(user_id, patient_id):
    """Проверяет, имеет ли пользователь доступ к данным пациента"""
    # Получаем роль пользователя
    role_query = """
    SELECT role FROM user WHERE id_user = %s
    """
    user_role = current_app.config['sql_provider'].execute_query(role_query, (user_id,))
    
    if not user_role:
        return False
    
    role = user_role[0]['role']
    
    # Менеджеры и врачи имеют доступ ко всем пациентам
    if role in ['manager', 'doctor']:
        return True
    
    # Пациент имеет доступ только к своим данным
    if role == 'patient':
        patient_query = """
        SELECT id_patient FROM patient WHERE user_id = %s AND id_patient = %s
        """
        result = current_app.config['sql_provider'].execute_query(
            patient_query, 
            (user_id, patient_id)
        )
        return bool(result)
    
    return False

@patient_bp.route('/api/patient/info/<int:patient_id>', methods=['GET'])
@login_required
def get_patient_info(patient_id):
    """Получение информации о пациенте"""
    if not has_access_to_patient_data(request.user_id, patient_id):
        return jsonify({'error': 'Нет доступа к данным пациента'}), 403

    query = """
    SELECT 
        p.id_patient,
        p.full_name,
        p.birth,
        p.passport_data,
        p.insurance_policy,
        p.phone,
        p.email,
        u.role
    FROM patient p
    JOIN user u ON u.id_user = p.user_id
    WHERE p.id_patient = %s
    """
    
    try:
        patient = current_app.config['sql_provider'].execute_query(query, (patient_id,))
        if not patient:
            return jsonify({'error': 'Пациент не найден'}), 404
        return jsonify(patient[0])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@patient_bp.route('/api/patient/appointments/<int:patient_id>', methods=['GET'])
@login_required
def get_patient_appointments(patient_id):
    """Получение записей пациента на прием"""
    if not has_access_to_patient_data(request.user_id, patient_id):
        return jsonify({'error': 'Нет доступа к данным пациента'}), 403

    query = """
    SELECT 
        t.id_tit as appointment_id,
        t.admission as date,
        TIME_FORMAT(t.time, '%H:%i') as time,
        d.full_name as doctor_name,
        d.specialization,
        c.type as cabinet_type,
        c.id_cab as cabinet_number,
        t.appearance,
        v.diagnosis,
        v.complaints
    FROM timetable t
    JOIN doctor d ON d.id_doc = t.doctor_id_doc
    JOIN cabinet c ON c.id_cab = t.cabinet_id_cab
    LEFT JOIN visiting v ON v.timetable_id = t.id_tit
    WHERE t.patient_id_patient = %s
    ORDER BY t.admission DESC, t.time DESC
    """
    
    try:
        appointments = current_app.config['sql_provider'].execute_query(query, (patient_id,))
        return jsonify(appointments)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@patient_bp.route('/api/patient/diagnoses/<int:patient_id>', methods=['GET'])
@login_required
def get_patient_diagnoses(patient_id):
    """Получение истории диагнозов пациента"""
    if not has_access_to_patient_data(request.user_id, patient_id):
        return jsonify({'error': 'Нет доступа к данным пациента'}), 403

    query = """
    SELECT 
        v.id_vis,
        v.diagnosis,
        v.complaints,
        v.date,
        TIME_FORMAT(v.time, '%H:%i') as time,
        d.full_name as doctor_name,
        d.specialization
    FROM visiting v
    JOIN doctor d ON d.id_doc = v.doctor_id_doc
    WHERE v.patient_id_patient = %s
    ORDER BY v.date DESC, v.time DESC
    """
    
    try:
        diagnoses = current_app.config['sql_provider'].execute_query(query, (patient_id,))
        return jsonify(diagnoses)
    except Exception as e:
        return jsonify({'error': str(e)}), 500 