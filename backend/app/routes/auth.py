from flask import Blueprint, request, jsonify, current_app
import bcrypt
import uuid
from datetime import timedelta
import json
from app.database.redis_provider import RedisProvider

auth_bp = Blueprint('auth', __name__)

def create_session(user_id: int, role: str) -> str:
    session_id = str(uuid.uuid4())
    session_data = {
        'user_id': user_id,
        'role': role
    }
    redis_client = RedisProvider.get_client()
    redis_client.setex(
        f"session:{session_id}",
        timedelta(hours=24),
        json.dumps(session_data)
    )
    return session_id

@auth_bp.route('/init', methods=['POST'])
def init_test_users():
    print("Starting init_test_users")  # Добавляем отладку
    # Проверяем, существуют ли уже пользователи
    check_query = current_app.config['sql_provider'].get_query('auth/check_user.sql')
    
    test_users = [
        {'login': 'admin', 'password': 'test', 'role_id': 1},
        {
            'login': 'doctor', 
            'password': 'test', 
            'role_id': 3,
            'doctor_info': {
                'full_name': 'Test Doctor',
                'passport_data': '1234 567890',
                'address': 'Test Street 1',
                'birth': '1985-01-01',
                'specialization': 'Therapist',
                'employment': '2023-01-01',
                'department_id': 1  # ID отделения Терапии
            }
        },
        {'login': 'manager', 'password': 'test', 'role_id': 4}
    ]
    
    created_users = []
    
    for user in test_users:
        print(f"Processing user: {user['login']}")  # Добавляем отладку
        # Проверяем существование пользователя
        result = current_app.config['sql_provider'].execute_query(check_query, (user['login'],))
        print(f"Check user result: {result}")  # Добавляем отладку
        
        if not result:
            print(f"Creating user: {user['login']}")
            # Хэшируем пароль
            salt = bcrypt.gensalt()
            password_hash = bcrypt.hashpw(user['password'].encode('utf-8'), salt)
            
            # Формируем запросы для транзакции
            transaction_queries = [
                # Создаем пользователя
                (
                    "INSERT INTO `user` (login, password_hash, role_id) VALUES (%s, %s, %s)",
                    (user['login'], password_hash.decode('utf-8'), user['role_id'])
                ),
                # Получаем ID пользователя
                (
                    "SELECT LAST_INSERT_ID() as id",
                    None
                )
            ]
            
            # Если это врач, добавляем запросы для создания врача
            if user['role_id'] == 3:
                doctor_info = user['doctor_info']
                print(f"Will create doctor")
                
                # Получаем SQL запросы
                create_doctor_query = current_app.config['sql_provider'].get_query('auth/create_doctor.sql')
                create_schedule_query = current_app.config['sql_provider'].get_query('auth/create_schedule.sql')
                
                # Подготавливаем данные для создания врача
                doctor_data = {
                    'department_id': doctor_info['department_id'],
                    'full_name': doctor_info['full_name'],
                    'passport_data': doctor_info['passport_data'],
                    'address': doctor_info['address'],
                    'birth': doctor_info['birth'],
                    'specialization': doctor_info['specialization'],
                    'employment': doctor_info['employment'],
                    'user_id': None  # Будет заполнено после создания пользователя
                }
                
                # Добавляем запрос на создание врача
                transaction_queries.append((create_doctor_query, doctor_data))
                # Получаем ID врача
                transaction_queries.append(("SELECT LAST_INSERT_ID() as id", None))
                
                # Добавляем запросы для создания расписания
                for day in range(1, 6):  # 1-5 (пн-пт)
                    schedule_data = {
                        'doctor_id': None,  # Будет заполнено после создания врача
                        'day_of_week': day,
                        'start_time': '09:00',
                        'end_time': '18:00',
                        'cabinet': '101'
                    }
                    transaction_queries.append((create_schedule_query, schedule_data))
            
            # Выполняем все запросы в одной транзакции
            results = current_app.config['sql_provider'].execute_transaction(transaction_queries)
            print(f"Transaction results: {results}")
            
            created_users.append(user['login'])
    
    if created_users:
        return jsonify({
            'message': 'Тестовые пользователи созданы успешно',
            'created_users': created_users
        }), 201
    else:
        return jsonify({
            'message': 'Все тестовые пользователи уже существуют'
        }), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not all(key in data for key in ['login', 'password']):
        return jsonify({'error': 'Не все поля заполнены'}), 400
    
    # Проверяем существование пользователя
    check_query = current_app.config['sql_provider'].get_query('auth/check_user.sql')
    result = current_app.config['sql_provider'].execute_query(check_query, (data['login'],))
    
    if result:
        return jsonify({'error': 'Пользователь с таким логином уже существует'}), 409
    
    # Хэшируем пароль
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), salt)
    
    # Выполняем все операции в одной транзакции
    queries = [
        (
            "INSERT INTO `user` (login, password_hash, role_id) VALUES (%s, %s, %s)",
            (data['login'], password_hash.decode('utf-8'), 2)
        ),
        (
            "SELECT LAST_INSERT_ID() as id",
            None
        ),
        (
            "INSERT INTO patient (user_id) VALUES (LAST_INSERT_ID())",
            None
        )
    ]
    
    try:
        current_app.config['sql_provider'].execute_transaction(queries)
        return jsonify({'message': 'Регистрация успешна'}), 201
    except Exception as e:
        print(f"Registration failed: {str(e)}")  # Добавляем логирование
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not all(key in data for key in ['login', 'password']):
        return jsonify({'error': 'Не все поля заполнены'}), 400
    
    # Добавим отладочный вывод
    print(f"Login attempt for user: {data['login']}")
    
    # Получаем пользователя
    query = current_app.config['sql_provider'].get_query('auth/get_user.sql')
    result = current_app.config['sql_provider'].execute_query(query, (data['login'],))
    
    if not result:
        return jsonify({'error': 'Неверный логин или пароль'}), 401
    
    user = result[0]
    
    # Добавим отладочный вывод
    print(f"Stored hash: {user['password_hash']}")
    print(f"Input password: {data['password']}")
    
    # Проверяем пароль
    if not bcrypt.checkpw(data['password'].encode('utf-8'), user['password_hash'].encode('utf-8')):
        return jsonify({'error': 'Неверный логин или пароль'}), 401
    
    # Создаем сессию
    session_id = create_session(user['id_user'], user['role_name'])
    
    response = jsonify({
        'message': 'Авторизация успешна',
        'user': {
            'id': user['id_user'],
            'login': data['login'],
            'role': user['role_name']
        }
    })
    
    response.set_cookie(
        'session_id',
        session_id,
        httponly=True,
        secure=True,
        samesite='Strict',
        max_age=86400
    )
    
    return response

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session_id = request.cookies.get('session_id')
    if session_id:
        redis_client = RedisProvider.get_client()
        redis_client.delete(f"session:{session_id}")
    
    response = jsonify({'message': 'Выход выполнен успешно'})
    response.delete_cookie('session_id')
    return response

# Декоратор для проверки аутентификации
def login_required(f):
    def wrapper(*args, **kwargs):
        session_id = request.cookies.get('session_id')
        if not session_id:
            return jsonify({'error': 'Требуется авторизация'}), 401
        
        redis_client = RedisProvider.get_client()
        session_data = redis_client.get(f"session:{session_id}")
        if not session_data:
            return jsonify({'error': 'Сессия истекла'}), 401
        
        session = json.loads(session_data)
        print(f"Session data: {session}")  # Добавляем отладку
        
        request.user_id = session['user_id']
        request.user_role = session['role']
        
        print(f"Set request.user_id = {request.user_id}")  # Добавляем отладку
        print(f"Set request.user_role = {request.user_role}")  # Добавляем отладку
        
        return f(*args, **kwargs)
    
    wrapper.__name__ = f.__name__
    return wrapper

# екоратор для проверки роли
def role_required(allowed_roles):
    def decorator(f):
        def wrapper(*args, **kwargs):
            if not hasattr(request, 'user_role'):
                return jsonify({'error': 'Требуется авторизация'}), 401
            
            if request.user_role not in allowed_roles:
                return jsonify({'error': 'Недостаточно прав'}), 403
            
            return f(*args, **kwargs)
        
        wrapper.__name__ = f.__name__
        return wrapper
    return decorator 