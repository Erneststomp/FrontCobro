import React from 'react';
import './Index.css';
import logo from '../../Images/LOGODIF.png'; // Ajuste la ruta según sea necesario

const Intro = () => {
  return (
    <div className='Main-div'>
      <h1>Bienvenido al Sistema de Cobro del DIF</h1>
      <img src={logo} alt='Logo' />
    </div>
  );
}

export default Intro;
