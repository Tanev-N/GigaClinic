from flask import Blueprint, request, jsonify, current_app
from .auth import login_required, role_required
from datetime import datetime, date, time, timedelta
import json

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if isinstance(obj, time):
            return obj.strftime('%H:%M:%S')
        if isinstance(obj, timedelta):
            return str(obj)
        return super().default(obj)

def init_app(app):
    app.register_blueprint(admin_bp)

@admin_bp.route('/profile', methods=['GET'])
@login_required
@role_required(['admin'])
def get_admin_profile():
    """Получить информацию о профиле администратора"""
    query = """
    SELECT 
        u.id_user,
        u.login
    FROM user u
    JOIN role r ON u.role_id = r.id_role
    WHERE u.id_user = %s AND r.name = 'admin'
    """
    result = current_app.config['sql_provider'].execute_query(query, (request.user_id,))
    
    if not result:
        return jsonify({'error': 'Администратор не найден'}), 404
        
    return jsonify(result[0])

@admin_bp.route('/tables', methods=['GET'])
@login_required
@role_required(['admin'])
def get_tables():
    """Получить список всех таблиц в базе данных"""
    query = """
    SELECT TABLE_NAME 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = DATABASE()
    """
    result = current_app.config['sql_provider'].execute_query(query)
    return jsonify([row['TABLE_NAME'] for row in result])

@admin_bp.route('/table/<table_name>', methods=['GET'])
@login_required
@role_required(['admin'])
def get_table_data(table_name):
    """Получить данные из указанной таблицы"""
    try:
        # Получаем информацию о столбцах
        columns_query = """
        SELECT 
            COLUMN_NAME,
            DATA_TYPE,
            IS_NULLABLE,
            COLUMN_KEY
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = %s
        """
        columns = current_app.config['sql_provider'].execute_query(columns_query, (table_name,))
        
        # Получаем данные
        data_query = f"SELECT * FROM {table_name}"
        data = current_app.config['sql_provider'].execute_query(data_query)
        
        # Преобразуем специальные типы данных
        processed_data = []
        for row in data:
            processed_row = {}
            for key, value in row.items():
                if isinstance(value, (datetime, date)):
                    processed_row[key] = value.isoformat()
                elif isinstance(value, time):
                    processed_row[key] = value.strftime('%H:%M:%S')
                elif isinstance(value, timedelta):
                    processed_row[key] = str(value)
                else:
                    processed_row[key] = value
            processed_data.append(processed_row)
        
        return jsonify({
            'columns': columns,
            'data': processed_data
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/table/<table_name>/schema', methods=['GET'])
@login_required
@role_required(['admin'])
def get_table_schema(table_name):
    """Получить схему таблицы"""
    try:
        # Получаем информацию о столбцах
        columns_query = """
        SELECT 
            COLUMN_NAME,
            DATA_TYPE,
            CHARACTER_MAXIMUM_LENGTH,
            IS_NULLABLE,
            COLUMN_KEY,
            COLUMN_DEFAULT,
            EXTRA
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = %s
        ORDER BY ORDINAL_POSITION
        """
        columns = current_app.config['sql_provider'].execute_query(columns_query, (table_name,))
        
        # Получаем информацию о внешних ключах
        fk_query = """
        SELECT
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = %s
        AND REFERENCED_TABLE_NAME IS NOT NULL
        """
        foreign_keys = current_app.config['sql_provider'].execute_query(fk_query, (table_name,))
        
        return jsonify({
            'columns': columns,
            'foreign_keys': foreign_keys
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/table/<table_name>/row', methods=['POST'])
@login_required
@role_required(['admin'])
def add_row(table_name):
    """Добавить новую запись в таблицу"""
    try:
        data = request.get_json()
        
        # Формируем SQL запрос
        columns = ', '.join(data.keys())
        values = ', '.join(['%s'] * len(data))
        query = f"INSERT INTO {table_name} ({columns}) VALUES ({values})"
        
        # Выполняем запрос
        current_app.config['sql_provider'].execute_query(
            query, 
            tuple(data.values()),
            return_last_id=True
        )
        
        return jsonify({'message': 'Запись успешно добавлена'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/table/<table_name>/row/<int:row_id>', methods=['PUT'])
@login_required
@role_required(['admin'])
def update_row(table_name, row_id):
    """Обновить существующую запись в таблице"""
    try:
        data = request.get_json()
        
        # Формируем SQL запрос
        set_clause = ', '.join([f"{key} = %s" for key in data.keys()])
        query = f"UPDATE {table_name} SET {set_clause} WHERE id_{table_name} = %s"
        
        # Выполняем запрос
        values = tuple(data.values()) + (row_id,)
        current_app.config['sql_provider'].execute_query(query, values)
        
        return jsonify({'message': 'Запись успешно обновлена'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/table/<table_name>/row/<int:row_id>', methods=['DELETE'])
@login_required
@role_required(['admin'])
def delete_row(table_name, row_id):
    """Удалить запись из таблицы"""
    try:
        query = f"DELETE FROM {table_name} WHERE id_{table_name} = %s"
        current_app.config['sql_provider'].execute_query(query, (row_id,))
        return jsonify({'message': 'Запись успешно удалена'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/execute', methods=['POST'])
@login_required
@role_required(['admin'])
def execute_query():
    """Выполнить произвольный SQL запрос"""
    try:
        data = request.get_json()
        query = data.get('query')
        
        if not query:
            return jsonify({'error': 'Запрос не указан'}), 400
            
        # Проверяем, что запрос не содержит опасных операций
        dangerous_keywords = ['DROP', 'TRUNCATE', 'DELETE FROM', 'ALTER']
        if any(keyword in query.upper() for keyword in dangerous_keywords):
            return jsonify({
                'error': 'Запрос содержит потенциально опасные операции'
            }), 400
        
        result = current_app.config['sql_provider'].execute_query(query)
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500 