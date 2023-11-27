import React from 'react';
import './NabBar.css';
import DIFLOGO from '../../Images/LOGODIF.png';
import { Link } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';

const NavBar = ({ setIsLoggedIn,userdata }) => {

  const handleLogout = async () => {
    try {
      const response = await axios.post('logout.php');
      if (response.data.result) {
        setIsLoggedIn(false);
        Cookies.set('isLoggedIn', 'false');
        Cookies.remove('user');
        console.log(response.data.msg)
      }
    } catch (error) {
      console.error('Error al cerrar la sesión:', error);
    }
  };
  const isAdmin = userdata.typeOfUser==='Admin';
  return (
    <nav className="navbar navbar-expand-lg navbar-light ">
      <div className='Nav-Full container-fluid'>
        <div className='Nav-Blur'></div>
        <Link style={{ textDecoration: 'none' }} to="/">
          <div className='Nav-Left'>
            <img src={DIFLOGO} className='Conejo' alt='' />
          </div>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className='collapse navbar-collapse Nav-Right' id="navbarNavAltMarkup">
          <ul className='navbar-nav ms-auto mb-2 mb-lg-0 Nav-List-Style Nav-List'>
          {Cookies.get('isLoggedIn') === 'true' && !isAdmin? (
              <li className='nav-item ms-1'><Link style={{ textDecoration: 'none' }} className='Nav-Text' to="/">Inicio</Link></li>
            ) : null}
            {Cookies.get('isLoggedIn') === 'true' ? (
              <li className='nav-item ms-1'><Link style={{ textDecoration: 'none' }} className='Nav-Text' to="/NewPay">Cobrar</Link></li>
            ) : null}
            {Cookies.get('isLoggedIn') === 'true' && isAdmin ? (
              <li className='nav-item ms-1'><Link style={{ textDecoration: 'none' }} className='Nav-Text' to="/Unidad">Unidades</Link></li>
            ) : null}
            {Cookies.get('isLoggedIn') === 'true' && isAdmin ? (
              <li className='nav-item ms-1'><Link style={{ textDecoration: 'none' }} className='Nav-Text' to="/Dependencias">Dependencias</Link></li>
            ) : null}
            {Cookies.get('isLoggedIn') === 'true' && isAdmin ? (
              <li className='nav-item ms-1'><Link style={{ textDecoration: 'none' }} className='Nav-Text' to="/AddConcepts">Agregar Conceptos</Link></li>
            ) : null}
            {Cookies.get('isLoggedIn') === 'true' && isAdmin ? (
              <li className='nav-item ms-1'><Link style={{ textDecoration: 'none' }} className='Nav-Text' to="/AddUsers">Agregar Usuarios</Link></li>
            ) : null}
             {Cookies.get('isLoggedIn') === 'true' && isAdmin ? (
              <li className='nav-item ms-1'><Link style={{ textDecoration: 'none' }} className='Nav-Text' to="/getConceptos">Conceptos Registrados</Link></li>
            ) : null}
            {Cookies.get('isLoggedIn') === 'true' && isAdmin ? (
              <li className='nav-item ms-1'><Link style={{ textDecoration: 'none' }} className='Nav-Text' to="/getUsuarios">Usuarios Registrados</Link></li>
            ) : null}
            {Cookies.get('isLoggedIn') === 'true'  ? (
              <li className='nav-item ms-1'><Link style={{ textDecoration: 'none' }} className='Nav-Text' to="/Cobros">Cobros Realizados</Link></li>
            ) : null}
            {Cookies.get('isLoggedIn') === 'true' ? (
              <li className='nav-item ms-1'><Link style={{ textDecoration: 'none' }} className='Nav-Text' to="/ReporteDetallado">Reporte</Link></li>
            ) : null}
            {Cookies.get('isLoggedIn') === 'true'  ? (
              <button onClick={handleLogout}>Cerrar Sesión</button>
            ) : (
              <button ><Link style={{ textDecoration: 'none' }} className='Nav-Textlog' to="/Login">Iniciar Sesión</Link></button>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default NavBar;
