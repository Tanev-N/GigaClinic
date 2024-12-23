import mysql.connector
from typing import Optional, Dict, List, Union
import os
import pathlib

class SQLProvider:
    def __init__(self, host: str, database: str, user: str, password: str):
        self.connection_params = {
            'host': host,
            'database': database,
            'user': user,
            'password': password,
            'charset': 'utf8mb4',
            'use_unicode': True,
            'collation': 'utf8mb4_unicode_ci',
            'autocommit': True
        }
        
        # Путь к директории с SQL запросами
        self.sql_path = pathlib.Path(__file__).parent / 'sql_queries'

    def get_connection(self):
        return mysql.connector.connect(**self.connection_params)

    def execute_query(self, query: str, params: Optional[tuple] = None) -> Union[List[Dict], int]:
        connection = self.get_connection()
        try:
            with connection.cursor(dictionary=True) as cursor:
                cursor.execute(query, params)
                if query.strip().upper().startswith('SELECT'):
                    return cursor.fetchall()
                else:
                    connection.commit()
                    return cursor.rowcount
        finally:
            connection.close()
    
    def get_query(self, filename: str) -> str:
        """Загружает SQL запрос из файла"""
        with open(self.sql_path / filename, 'r', encoding='utf-8') as file:
            return file.read() 