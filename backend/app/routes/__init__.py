from flask import Blueprint, jsonify, make_response, current_app
from .auth import login_required, role_required

main_bp = Blueprint('main', __name__)

@main_bp.route('/api/department/head', methods=['GET'])
@login_required
@role_required(['admin', 'doctor'])
def get_department_head():
    query = current_app.config['sql_provider'].get_query('department/get_head.sql')
    result = current_app.config['sql_provider'].execute_query(query)
    if result:
        head = result[0]['head']
        response = make_response(jsonify({'head': head}))
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
        return response
    else:
        return jsonify({'head': None}), 404