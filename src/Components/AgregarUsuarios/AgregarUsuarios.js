import React, { useState, useEffect } from 'react';
import './AgregarUsuarios.css';
import axios from '../../axiosConfig.js';
import Swal from 'sweetalert2';

const AddUser = () => {
  const [formData, setFormData] = useState({
    unidad: '',
    dependencia: '',
    nombre: '',
    email: '',
    password_: '',
    typeOfUser: '',
    emailconf: '',
    password_conf: ''
  });
  const [unidades, setUnidades] = useState([]);
  const [dependencias, setDependencias] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar unidades
        const resUnidades = await axios.get('getUnidades.php');
        const parsedResponse1 = resUnidades.data;
        const activeConcepts1 = parsedResponse1.unidades.filter(concept => concept.estado === 'active');
        setUnidades(activeConcepts1);

        // Cargar dependencias
        const resDependencias = await axios.get('getDependencias.php');
        const parsedResponse = resDependencias.data;
        const activeConcepts = parsedResponse.dependencias.filter(concept => concept.estado === 'active');
        setDependencias(activeConcepts);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    cargarDatos();
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.email !== formData.emailconf) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Los correos electrónicos no coinciden',
      });
      return; // Detener la función aquí si no coinciden
    }

    if (formData.password_ !== formData.password_conf) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden',
      });
      return; // Detener la función aquí si no coinciden
    }
    // Enviar los datos al servidor PHP utilizando Axios
    try {
      const response = await axios.post('saveUser.php', formData);
      if (response.data.result) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "El Usuario ha sido registrado exitosamente",
          showConfirmButton: false,
          timer: 1500
        });
      }
    } catch (error) {
      console.error('Error al enviar los datos al servidor:', error);
    }
  };

  return (
    <div className='Main-div'>
      <form onSubmit={handleSubmit}>
          {/* ...otros campos del formulario... */}
          <div className="form-group">
            <label>
            Unidad:
            <select name="unidad" required value={formData.unidad} onChange={handleChange}>
              <option value="">Seleccione una unidad</option>
              {unidades && unidades.map((unidad) => (
                <option key={unidad.id} value={unidad.unidad}>
                  {unidad.unidad}
                </option>
              ))}
            </select>
          </label>

          <label>
            Dependencia:
            <select name="dependencia" required value={formData.dependencia} onChange={handleChange}>
              <option value="">Seleccione una dependencia</option>
              {dependencias && dependencias.map((dependencia) => (
                <option key={dependencia.id} value={dependencia.dependencia}>
                  {dependencia.dependencia}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Nombre:
          <input type="text" required name="nombre" value={formData.nombre} onChange={handleChange} />
        </label>
        <div className="form-group">
          <label>
            Email:
            <input type="text" required name="email" value={formData.email} onChange={handleChange} />
          </label>
          <label>
            Contraseña:
            <input type="password" required name="password_" value={formData.password_} onChange={handleChange} />
          </label>
        </div>
        <div className="form-group">
          <label>
            Confirmar Email:
            <input type="text" required name="emailconf" value={formData.emailconf} onChange={handleChange} />
          </label>
          <label>
            Confirmar Contraseña:
            <input type="password" required name="password_conf" value={formData.password_conf} onChange={handleChange} />
          </label>
        </div>
        <label>
          Tipo de Usuario:
        <select name="typeOfUser" required value={formData.typeOfUser} onChange={handleChange}>
          <option value="">Seleccione un tipo</option>
          <option value="Admin">Admin</option>
          <option value="User">User</option>
          <option value="Supervisor">Supervisor</option>
        </select>
      </label>

        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

export default AddUser;
