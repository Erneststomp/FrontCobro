import React, { useState } from 'react';
import Cookies from 'js-cookie';
import axios from '../../axiosConfig.js'
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const LoginForm = ({ setIsLoggedIn, setUser }) => {
  const [formData, setFormData] = useState({
    email: '', 
    password_: '',
  });

  const navigate = useNavigate(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

      axios.post('login.php',  formData )
        .then(response => {
          const responseText = response.data;
          if (responseText.result) {
            setIsLoggedIn(true);
            Cookies.set('isLoggedIn', 'true', { path: '/' });
            const userData = { nombre: responseText.user.nombre, typeOfUser: responseText.user.typeOfUser, unidad:responseText.user.unidad,dependencia:responseText.user.dependencia,email:responseText.user.email };
            Cookies.set('user', JSON.stringify(userData), { expires: 1 }); 
            setUser(userData);
            navigate('/');
          }
          else {
            if(responseText.msg==='El usuario ha sido deshabilitado'){
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'El Usuario ha sido deshabilitado',
              });
            }else{
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'El correo y la contraseña no coinciden!',
            });
          }
          }
        })
        .catch(error => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al intentar iniciar sesión.',
        });
        });
  };

  return (
    <div className='Main-div'>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type="email" name="email" value={formData.email} required onChange={handleChange} />
        </label>
        <label>
          Password:
          <input type="password" name="password_" value={formData.password_} required onChange={handleChange} />
        </label>
        <input  className='Submit_style' type="submit" value="Submit" />
      </form>
    </div>
  );
};

export default LoginForm;
