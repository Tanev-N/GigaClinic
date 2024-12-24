import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Logo.module.scss';
import logoIcon from '@/shared/assets/icons/Logo_secondary.svg';

export const Logo = () => {
  return (
    <Link to="/">
      <div className={styles.logo}>
        <img 
          className={styles.logoImage} 
          src={logoIcon} 
          alt="Logo" 
        />
      </div>
    </Link>
  );
};