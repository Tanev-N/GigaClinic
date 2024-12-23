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
    
    # Добавляем пользователя
    insert_query = current_app.config['sql_provider'].get_query('auth/create_user.sql')
    try:
        current_app.config['sql_provider'].execute_query(
            insert_query,
            (data['login'], password_hash.decode('utf-8'))
        )
        return jsonify({'message': 'Регистрация успешна'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not all(key in data for key in ['login', 'password']):
        return jsonify({'error': 'Не все поля заполнены'}), 400
    
    # Получаем данные пользователя
    query = current_app.config['sql_provider'].get_query('auth/get_user.sql')
    result = current_app.config['sql_provider'].execute_query(query, (data['login'],))
    
    if not result:
        return jsonify({'error': 'Пользователь не найден'}), 404
    
    user = result[0]
    
    # Проверяем пароль
    if not bcrypt.checkpw(
        data['password'].encode('utf-8'),
        user['password_hash'].encode('utf-8')
    ):
        return jsonify({'error': 'Неверный пароль'}), 401
    
    # Создаем сессию
    session_id = create_session(user['id_user'], user['role_name'])
    
    response = jsonify({
        'message': 'Авторизация успешна',
        'user_id': user['id_user']  # Изменено с id_user на user_id дя фронтенда
    })
    
    # Устанавливаем куки
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
        request.user_id = session['user_id']
        request.user_role = session['role']
        
        return f(*args, **kwargs)
    
    wrapper.__name__ = f.__name__
    return wrapper

# Декоратор для проверки роли
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