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
        
        self.sql_path = pathlib.Path(__file__).parent / 'sql_queries'

    def get_connection(self):
        return mysql.connector.connect(**self.connection_params)

    def execute_query(self, query: str, params: Optional[tuple] = None, return_last_id: bool = False) -> Union[List[Dict], int]:
        connection = None
        cursor = None
        try:
            connection = mysql.connector.connect(**self.connection_params)
            cursor = connection.cursor(dictionary=True)
            
            cursor.execute(query, params)
            
            # Всегда проверяем наличие результатов
            if cursor.with_rows:
                result = cursor.fetchall()
            else:
                result = []

            # Для не-SELECT запросов
            if not query.strip().upper().startswith('SELECT'):
                if return_last_id:
                    result = cursor.lastrowid
                else:
                    result = cursor.rowcount
                connection.commit()
            
            return result
            
        except Exception as e:
            if connection:
                connection.rollback()
            raise e
            
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def execute_transaction(self, queries: List[tuple[str, Optional[tuple]]]) -> List[List[Dict]]:
        """Выполняет несколько запросов в одной транзакции"""
        connection = mysql.connector.connect(**self.connection_params)
        cursor = None
        try:
            cursor = connection.cursor(dictionary=True)
            results = []
            user_id = None
            doctor_id = None
            
            for query, params in queries:
                print(f"Executing query: {query}")
                print(f"With params: {params}")
                
                # Если это запрос на создание врача и у нас есть user_id
                if isinstance(params, dict) and 'user_id' in params and params['user_id'] is None and user_id:
                    params = params.copy()
                    params['user_id'] = user_id
                    print(f"Setting user_id to {user_id}")
                
                # Если это запрос на создание расписания и у нас есть doctor_id
                if isinstance(params, dict) and 'doctor_id' in params and params['doctor_id'] is None and doctor_id:
                    params = params.copy()
                    params['doctor_id'] = doctor_id
                    print(f"Setting doctor_id to {doctor_id}")
                
                cursor.execute(query, params)
                
                if query.strip().upper().startswith('SELECT'):
                    result = cursor.fetchall()
                    if not result and 'LAST_INSERT_ID()' in query:
                        # Если запрос LAST_INSERT_ID() не вернул результатов,
                        # получаем ID напрямую
                        result = [{'id': cursor.lastrowid}]
                    results.append(result)
                    print(f"Query result: {result}")
                    
                    # Если это запрос LAST_INSERT_ID
                    if 'LAST_INSERT_ID()' in query and result:
                        last_id = result[0].get('id')
                        if last_id:
                            # Определяем, для какой таблицы это ID
                            if user_id is None:
                                user_id = last_id
                                print(f"Got user_id: {user_id}")
                            else:
                                doctor_id = last_id
                                print(f"Got doctor_id: {doctor_id}")
                else:
                    results.append([{'affected_rows': cursor.rowcount}])
                    # Для INSERT запросов также сохраняем lastrowid
                    if query.strip().upper().startswith('INSERT'):
                        last_id = cursor.lastrowid
                        if last_id:
                            if user_id is None:
                                user_id = last_id
                                print(f"Got user_id from INSERT: {user_id}")
                            elif doctor_id is None:
                                doctor_id = last_id
                                print(f"Got doctor_id from INSERT: {doctor_id}")
            
            connection.commit()
            print("Transaction committed successfully")
            return results
            
        except Exception as e:
            if connection:
                connection.rollback()
            print(f"Transaction failed: {str(e)}")
            raise e
            
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()

    def get_query(self, filename: str) -> str:
        with open(self.sql_path / filename, 'r', encoding='utf-8') as file:
            return file.read()