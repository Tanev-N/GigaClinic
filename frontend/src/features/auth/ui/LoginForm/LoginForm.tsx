import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { userActions } from '@/entities/User';
import styles from '@/shared/styles/forms.module.scss';

export const LoginForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        login: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка при входе');
            }

            // Сохраняем данные пользователя в Redux и localStorage
            dispatch(userActions.setAuthData(data.user));
            localStorage.setItem('user', JSON.stringify(data.user));

            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ошибка при входе');
        } finally {
            setIsLoading(false);
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
                        value={formData.login}
                        onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                        placeholder="Введите логин"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Пароль</label>
                    <input
                        type="password"
                        className={styles.input}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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