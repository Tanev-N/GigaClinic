import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { userActions } from '@/entities/User';
import styles from '@/shared/styles/forms.module.scss';

export const LoginForm = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!login || !password) {
            setError('Пожалуйста, заполните все поля');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ login, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                switch (response.status) {
                    case 404:
                        setError('Пользователь не найден');
                        break;
                    case 401:
                        setError('Неверный пароль');
                        break;
                    default:
                        setError('Ошибка входа в систему');
                }
                return;
            }

            const userData = {
                id: data.user_id,
                username: login,
            };

            dispatch(userActions.setAuthData(userData));
            localStorage.setItem('user', JSON.stringify(userData));
            navigate(from, { replace: true });
        } catch (err) {
            setError('Проблема с подключением к серверу');
        }
    };

    return (
        <div className={styles.authContainer}>
            <form className={styles.authForm} onSubmit={handleSubmit}>
                <h1 className={styles.title}>Вход</h1>
                
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.formGroup}>
                    <label className={styles.label}>Логин</label>
                    <input
                        type="text"
                        className={styles.input}
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        placeholder="Введите логин"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Пароль</label>
                    <input
                        type="password"
                        className={styles.input}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Введите пароль"
                    />
                </div>

                <button type="submit" className={styles.submitButton}>
                    Войти
                </button>

                <div className={styles.bottomText}>
                    Еще нет аккаунта?{' '}
                    <Link to="/register" className={styles.link}>
                        Зарегистрироваться
                    </Link>
                </div>
            </form>
        </div>
    );
}; 