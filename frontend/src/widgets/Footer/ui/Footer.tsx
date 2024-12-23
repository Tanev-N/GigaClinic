import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';
import { Logo } from '@/shared/ui/Logo';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div className={styles.logoSection}>
            <Logo />
          </div>
          <nav className={styles.navigation}>
            <div className={styles.navRow}>
              <Link to="/schedule" className={styles.navLink}>Расписание врачей</Link>
              <Link to="/appointment" className={styles.navLink}>Запись на прием к врачу</Link>
              <Link to="/contacts" className={styles.navLink}>Вызвать врача на дом</Link>
            </div>
          </nav>
          <div className={styles.socialLinks}>
            <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <div className={styles.vkIcon} />
            </a>
            <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
              <div className={styles.telegramIcon} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}; 