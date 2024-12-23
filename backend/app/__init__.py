from flask import Flask
from flask_cors import CORS
import os
from app.database.sql_provider import SQLProvider
from app.database.redis_provider import RedisProvider


def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True)

    app.config['sql_provider'] = SQLProvider(
        host=os.getenv('DB_HOST', 'db'),
        database=os.getenv('DB_NAME', 'clinic'),
        user=os.getenv('DB_USER', 'clinic'),
        password=os.getenv('DB_PASSWORD', 'clinic')
    )

    RedisProvider.initialize(
        host=os.getenv('REDIS_HOST', 'redis'),
        port=int(os.getenv('REDIS_PORT', 6379))
    )

    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')

    from app.routes import main_bp
    from app.routes.auth import auth_bp
    from app.routes.profile import profile_bp
    from app.routes.schedule import schedule_bp
    from app.routes.appointment import appointment_bp
    from app.routes.doctor import doctor_bp
    from app.routes.reports import reports_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(profile_bp)
    app.register_blueprint(schedule_bp)
    app.register_blueprint(appointment_bp)
    app.register_blueprint(doctor_bp)
    app.register_blueprint(reports_bp)

    return app 