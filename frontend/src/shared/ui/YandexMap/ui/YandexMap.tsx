import React, { useEffect } from 'react';
import styles from './YandexMap.module.scss';

declare global {
  interface Window {
    ymaps: any;
  }
}

export const YandexMap = () => {
  useEffect(() => {
    window.ymaps.ready(() => {
      const map = new window.ymaps.Map('map', {
        center: [55.7539, 37.6208], 
        zoom: 15
      });


      const placemark = new window.ymaps.Placemark([55.7539, 37.6208], {
        balloonContent: 'Московский Кремль'
      });

      map.geoObjects.add(placemark);
    });
  }, []);

  return <div id="map" className={styles.map}></div>;
}; 