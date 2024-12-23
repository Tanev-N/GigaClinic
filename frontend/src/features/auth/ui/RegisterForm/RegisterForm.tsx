import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '@/shared/styles/forms.module.scss';

export const RegisterForm = () => {
    const [formData, setFormData] = useState({
        login: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!Object.values(formData).every(Boolean)) {
            setError('Пожалуйста, заполните все поля');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    login: formData.login,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Ошибка при регистрации');
                return;
            }

            navigate('/login', { 
                state: { message: 'Регистрация успешна. Пожалуйста, войдите в систему.' }
            });
        } catch (err) {
            setError('Проблема с подключением к серверу');
        }
    };

    return (
        <div className={styles.authContainer}>
            <form className={styles.authForm} onSubmit={handleSubmit}>
                <h1 className={styles.title}>Регистрация</h1>
                
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.formGroup}>
                    <label className={styles.label}>Логин</label>
                    <input
                        type="text"
                        value={formData.login}
                        onChange={(e) => setFormData({...formData, login: e.target.value})}
                        className={styles.input}
                        placeholder="Введите логин"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Пароль</label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className={styles.input}
                        placeholder="Введите пароль"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Подтверждение пароля</label>
                    <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className={styles.input}
                        placeholder="Повторите пароль"
                    />
                </div>

                <button type="submit" className={styles.submitButton}>
                    Зарегистрироваться
                </button>

                <div className={styles.bottomText}>
                    Уже есть аккаунт?{' '}
                    <Link to="/login" className={styles.link}>
                        Войти
                    </Link>
                </div>
            </form>
        </div>
    );
}; 