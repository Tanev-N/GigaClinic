import React from 'react';
import { Link } from 'react-router-dom';
import styles from './MainPage.module.scss';
import { YandexMap } from '@/shared/ui/YandexMap';

const MainPage = () => {
  return (
    <div className={styles.mainPage}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Медицинский центр</h1>
            <p className={styles.subtitle}>Качественная медицинская помощь для всей семьи</p>
            <Link to="/appointment" className={styles.ctaButton}>
              Записаться на приём
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.services}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Наши услуги</h2>
          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>🏥</div>
              <h3>Консультации врачей</h3>
              <p>Приём ведут специалисты высшей категории</p>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>🚑</div>
              <h3>Вызов врача на дом</h3>
              <p>Оперативный выезд в любой район города</p>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.serviceIcon}>📋</div>
              <h3>Диагностика</h3>
              <p>Современное оборудование и точные результаты</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <h3>Онлайн-запись</h3>
              <p>Запишитесь к врачу не выходя из дома</p>
              <Link to="/appointment" className={styles.featureLink}>
                Записаться →
              </Link>
            </div>
            <div className={styles.featureCard}>
              <h3>Расписание врачей</h3>
              <p>Удобный график работы специалистов</p>
              <Link to="/schedule" className={styles.featureLink}>
                Посмотреть →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.contacts}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Контакты</h2>
          <div className={styles.contactsGrid}>
            <div className={styles.contactInfo}>
              <h3>Адрес</h3>
              <p>ул. Примерная, 123</p>
              <h3>Телефон</h3>
              <p>+7 (999) 123-45-67</p>
              <h3>График работы</h3>
              <p>Пн-Пт: 8:00 - 20:00</p>
              <p>Сб-Вс: 9:00 - 18:00</p>
            </div>
            <div className={styles.map}>
              <YandexMap />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainPage; 