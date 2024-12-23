from flask import Blueprint, request, jsonify, current_app
from .auth import login_required, role_required
import json
from datetime import datetime, timedelta

reports_bp = Blueprint('reports', __name__)

class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.strftime('%Y-%m-%d %H:%M:%S')
        if isinstance(obj, timedelta):
            return str(obj)
        return super().default(obj)

@reports_bp.route('/api/reports/types', methods=['GET'])
@login_required
@role_required(['manager', 'admin'])
def get_report_types():
    query = "SELECT * FROM report_type"
    result = current_app.config['sql_provider'].execute_query(query)
    return jsonify(result)

@reports_bp.route('/api/reports/available-doctors', methods=['GET'])
@login_required
@role_required(['manager', 'admin'])
def get_available_doctors():
    query = """
    SELECT DISTINCT d.id_doc, d.full_name
    FROM doctor d
    JOIN visiting v ON v.doctor_id_doc = d.id_doc
    ORDER BY d.full_name
    """
    result = current_app.config['sql_provider'].execute_query(query)
    return jsonify(result)

@reports_bp.route('/api/reports/available-months/all', methods=['GET'])
@login_required
@role_required(['manager', 'admin'])
def get_all_available_months():
    query = """
    SELECT DISTINCT 
        YEAR(date) as year,
        MONTH(date) as month,
        COUNT(DISTINCT patient_id_patient) as patient_count
    FROM visiting
    GROUP BY YEAR(date), MONTH(date)
    HAVING patient_count > 0
    ORDER BY year DESC, month DESC
    """
    result = current_app.config['sql_provider'].execute_query(query)
    
    # Форматируем результат для фронтенда
    formatted_result = []
    for row in result:
        month_name = datetime(2000, row['month'], 1).strftime('%B')
        formatted_result.append({
            'year': row['year'],
            'month': row['month'],
            'month_name': month_name,
            'display_name': f"{month_name} {row['year']}"
        })
    
    return jsonify(formatted_result)

@reports_bp.route('/api/reports/available-months/<int:doctor_id>', methods=['GET'])
@login_required
@role_required(['manager', 'admin'])
def get_available_months(doctor_id):
    query = """
    SELECT DISTINCT 
        YEAR(date) as year,
        MONTH(date) as month,
        COUNT(DISTINCT patient_id_patient) as patient_count
    FROM visiting
    WHERE doctor_id_doc = %s
    GROUP BY YEAR(date), MONTH(date)
    HAVING patient_count > 0
    ORDER BY year DESC, month DESC
    """
    result = current_app.config['sql_provider'].execute_query(query, (doctor_id,))
    
    # Форматируем результат для фронтенда
    formatted_result = []
    for row in result:
        month_name = datetime(2000, row['month'], 1).strftime('%B')
        formatted_result.append({
            'year': row['year'],
            'month': row['month'],
            'month_name': month_name,
            'display_name': f"{month_name} {row['year']}"
        })
    
    return jsonify(formatted_result)

@reports_bp.route('/api/reports/available-diagnoses', methods=['GET'])
@login_required
@role_required(['manager', 'admin'])
def get_available_diagnoses():
    query = """
    SELECT DISTINCT diagnosis
    FROM visiting
    WHERE diagnosis IS NOT NULL AND diagnosis != ''
    ORDER BY diagnosis
    """
    result = current_app.config['sql_provider'].execute_query(query)
    return jsonify([row['diagnosis'] for row in result])

@reports_bp.route('/api/reports/generate', methods=['POST'])
@login_required
@role_required(['manager', 'admin'])
def generate_report():
    data = request.get_json()
    
    if not all(key in data for key in ['report_type_id', 'parameters']):
        return jsonify({'error': 'Не все параметры указаны'}), 400
    
    # Получаем тип отчета
    type_query = "SELECT * FROM report_type WHERE id_report_type = %s"
    report_type = current_app.config['sql_provider'].execute_query(type_query, (data['report_type_id'],))
    
    if not report_type:
        return jsonify({'error': 'Тип отчета не найден'}), 404
    
    report_type = report_type[0]
    required_params = json.loads(report_type['parameters'])['required']
    
    # Проверяем наличие всех необходимых параметров
    if not all(param in data['parameters'] for param in required_params):
        return jsonify({'error': 'Не все необходимые параметры указаны'}), 400
    
    # Получаем SQL запрос для отчета
    if report_type['id_report_type'] == 1:
        query = current_app.config['sql_provider'].get_query('reports/doctor_patients_month.sql')
    elif report_type['id_report_type'] == 2:
        query = current_app.config['sql_provider'].get_query('reports/total_patients_month.sql')
    elif report_type['id_report_type'] == 3:
        query = current_app.config['sql_provider'].get_query('reports/patients_by_diagnosis.sql')
    else:
        return jsonify({'error': 'Неподдерживаемый тип отчета'}), 400
    
    try:
        # Выполняем запрос
        result = current_app.config['sql_provider'].execute_query(query, data['parameters'])
        
        # Форматируем результат для лучшего отображения
        formatted_result = {
            'summary': {},
            'details': result
        }
        
        if report_type['id_report_type'] == 1:
            if result:
                formatted_result['summary'] = {
                    'doctor_name': result[0]['doctor_name'],
                    'total_patients': result[0]['patient_count'],
                    'period': f"{datetime(2000, int(data['parameters']['month']), 1).strftime('%B')} {data['parameters']['year']}"
                }
        elif report_type['id_report_type'] == 2:
            if result:
                formatted_result['summary'] = {
                    'total_patients': result[0]['total_patients'],
                    'period': f"{datetime(2000, int(data['parameters']['month']), 1).strftime('%B')} {data['parameters']['year']}"
                }
        elif report_type['id_report_type'] == 3:
            if result:
                formatted_result['summary'] = {
                    'diagnosis': data['parameters']['diagnosis'],
                    'total_patients': result[0]['patient_count'],
                    'doctors': result[0]['doctors'].split(', '),
                    'patients_list': result[0]['patients_list'].split('; ')
                }
        
        # Сохраняем отчет в базу
        save_query = """
        INSERT INTO report (report_type_id, created_by, parameters, result)
        VALUES (%s, %s, %s, %s)
        """
        report_id = current_app.config['sql_provider'].execute_query(
            save_query,
            (
                data['report_type_id'],
                request.user_id,
                json.dumps(data['parameters']),
                json.dumps(formatted_result)
            ),
            return_last_id=True
        )
        
        # Сохраняем детали отчета
        if report_id:
            save_report_details(report_id, data['report_type_id'], data['parameters'], result)
        
        return jsonify({
            'report_type': report_type['name'],
            'parameters': data['parameters'],
            'result': formatted_result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/api/reports/history', methods=['GET'])
@login_required
@role_required(['manager', 'admin'])
def get_reports_history():
    query = """
    SELECT 
        r.*,
        rt.name as report_type_name,
        rt.description as report_type_description
    FROM report r
    JOIN report_type rt ON r.report_type_id = rt.id_report_type
    WHERE r.created_by = %s
    ORDER BY r.created_at DESC
    """
    
    result = current_app.config['sql_provider'].execute_query(query, (request.user_id,))
    return jsonify(result)

@reports_bp.route('/api/reports/details/<int:report_id>', methods=['GET'])
@login_required
@role_required(['manager', 'admin'])
def get_report_details(report_id):
    # Получаем информацию об отчете
    report_query = """
    SELECT r.*, rt.name as report_type_name
    FROM report r
    JOIN report_type rt ON r.report_type_id = rt.id_report_type
    WHERE r.id_report = %s AND r.created_by = %s
    """
    report = current_app.config['sql_provider'].execute_query(report_query, (report_id, request.user_id))
    
    if not report:
        return jsonify({'error': 'Отчет не найден'}), 404
    
    # Получаем детали отчета
    details_query = """
    SELECT 
        rd.*,
        p.passport_data as patient_name,
        p.birth as patient_birth,
        p.address as patient_address,
        d.full_name as doctor_name,
        d.specialization as doctor_specialization,
        v.diagnosis,
        v.complaints,
        DATE_FORMAT(v.date, '%d.%m.%Y') as visit_date_formatted,
        TIME_FORMAT(v.time, '%H:%i') as visit_time
    FROM report_details rd
    JOIN patient p ON rd.patient_id = p.id_patient
    LEFT JOIN doctor d ON rd.doctor_id = d.id_doc
    LEFT JOIN visiting v ON v.timetable_id = (
        SELECT t.id_tit 
        FROM timetable t 
        WHERE t.patient_id_patient = rd.patient_id 
        AND t.doctor_id_doc = rd.doctor_id 
        AND DATE(t.admission) = rd.visit_date
        LIMIT 1
    )
    WHERE rd.report_id = %s
    ORDER BY rd.visit_date DESC, visit_time DESC
    """
    details = current_app.config['sql_provider'].execute_query(details_query, (report_id,))
    
    # Преобразуем даты в строки для JSON
    for detail in details:
        if 'visit_date' in detail and isinstance(detail['visit_date'], datetime):
            detail['visit_date'] = detail['visit_date'].strftime('%Y-%m-%d')
        if 'patient_birth' in detail and isinstance(detail['patient_birth'], datetime):
            detail['patient_birth'] = detail['patient_birth'].strftime('%Y-%m-%d')
    
    response_data = {
        'report': report[0],
        'details': details
    }
    
    return jsonify(response_data)

def save_report_details(report_id, report_type_id, parameters, result):
    """Сохраняет детали отчета в таблицу report_details"""
    if not result:
        return
        
    details_query = """
    INSERT INTO report_details (
        report_id, 
        patient_id, 
        doctor_id, 
        visit_date, 
        diagnosis
    ) VALUES (%s, %s, %s, %s, %s)
    """
    
    try:
        if report_type_id == 1:  # Отчет по врачу за месяц
            # Получаем список виз��тов за указанный месяц
            visits_query = """
            SELECT DISTINCT 
                v.patient_id_patient,
                v.doctor_id_doc,
                v.date,
                v.diagnosis
            FROM visiting v
            WHERE v.doctor_id_doc = %s 
            AND YEAR(v.date) = %s 
            AND MONTH(v.date) = %s
            """
            visits = current_app.config['sql_provider'].execute_query(
                visits_query,
                (parameters['doctor_id'], parameters['year'], parameters['month'])
            )
            
            for visit in visits:
                current_app.config['sql_provider'].execute_query(
                    details_query,
                    (
                        report_id,
                        visit['patient_id_patient'],
                        visit['doctor_id_doc'],
                        visit['date'],
                        visit['diagnosis']
                    )
                )
                    
        elif report_type_id == 2:  # Общий отчет за месяц
            # Получаем список всех визитов за указанный месяц
            visits_query = """
            SELECT DISTINCT 
                v.patient_id_patient,
                v.doctor_id_doc,
                v.date,
                v.diagnosis
            FROM visiting v
            WHERE YEAR(v.date) = %s 
            AND MONTH(v.date) = %s
            """
            visits = current_app.config['sql_provider'].execute_query(
                visits_query,
                (parameters['year'], parameters['month'])
            )
            
            for visit in visits:
                current_app.config['sql_provider'].execute_query(
                    details_query,
                    (
                        report_id,
                        visit['patient_id_patient'],
                        visit['doctor_id_doc'],
                        visit['date'],
                        visit['diagnosis']
                    )
                )
                
        elif report_type_id == 3:  # Отчет по диагнозу
            # Получаем список всех пациентов с указанным диагнозом
            diagnosis_query = """
            SELECT DISTINCT 
                v.patient_id_patient,
                v.doctor_id_doc,
                v.date,
                v.diagnosis
            FROM visiting v
            WHERE v.diagnosis LIKE CONCAT('%%', %s, '%%')
            """
            visits = current_app.config['sql_provider'].execute_query(
                diagnosis_query,
                (parameters['diagnosis'],)
            )
            
            for visit in visits:
                current_app.config['sql_provider'].execute_query(
                    details_query,
                    (
                        report_id,
                        visit['patient_id_patient'],
                        visit['doctor_id_doc'],
                        visit['date'],
                        visit['diagnosis']
                    )
                )
    except Exception as e:
        print(f"Error saving report details: {str(e)}")
        # Можно добавить логирование ошибки

@reports_bp.route('/api/reports/<int:report_id>', methods=['DELETE'])
@login_required
@role_required(['manager', 'admin'])
def delete_report(report_id):
    # Проверяем, существует ли отчет и принадлежит ли он текущему пользователю
    check_query = """
    SELECT id_report FROM report 
    WHERE id_report = %s AND created_by = %s
    """
    report = current_app.config['sql_provider'].execute_query(check_query, (report_id, request.user_id))
    
    if not report:
        return jsonify({'error': 'Отчет не найден'}), 404
    
    try:
        # Сначала удаляем детали отчета
        delete_details_query = "DELETE FROM report_details WHERE report_id = %s"
        current_app.config['sql_provider'].execute_query(delete_details_query, (report_id,))
        
        # Затем удаляем сам отчет
        delete_report_query = "DELETE FROM report WHERE id_report = %s"
        current_app.config['sql_provider'].execute_query(delete_report_query, (report_id,))
        
        return jsonify({'message': 'Отчет успешно удален'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500