import React from 'react';
import styles from './StepIndicator.module.scss';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { number: 1, text: 'Выбор ЛПУ' },
  { number: 2, text: 'Выбор специалиста' },
  { number: 3, text: 'Выбор времени' },
];

export const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  return (
    <div className={styles.stepsContainer}>
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className={`${styles.step} ${currentStep === step.number ? styles.active : ''} ${currentStep > step.number ? styles.completed : ''}`}>
            <div className={styles.number}>{step.number}</div>
            <div className={styles.text}>{step.text}</div>
          </div>
          {index < steps.length - 1 && (
            <div className={`${styles.line} ${currentStep > step.number ? styles.completed : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}; 