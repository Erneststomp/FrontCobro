import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig.js';
import Swal from 'sweetalert2';

const ConceptForm = () => {
  const [formData, setFormData] = useState({
    servicio: '',
    costo: '',
    dependencia: '',
    subdependencia:'',
    unidad: '',
    plazos: false,
  });
  const [unidades, setUnidades] = useState([]);
  const [dependencias, setDependencias] = useState([]);
  const [subdependencias, setSubdependencias] = useState([]);


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
    const { name, value, type, checked } = e.target;
  
    // Primero, actualiza el estado formData
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === 'checkbox' ? checked : value,
      // Limpia el campo subdependencia si la dependencia seleccionada no es 'Coordinacíon de Salud'
      ...(name === 'dependencia' && value !== 'Coordinacíon de Salud' && { subdependencia: '' }),
    }));
  
    // Luego, maneja las subdependencias
    if (name === 'dependencia') {
      if (value === 'Coordinacíon de Salud') {
        cargarSubdependencias();
      } else {
        setSubdependencias([]);
      }
    }
  };
  
  
  const cargarSubdependencias = async () => {
    try {
      const ressubdep = await axios.get(`getSubdependencias.php`);
      const parsedResponsesub = ressubdep.data;
      const activeConcepts2 = await parsedResponsesub.subdependencias.filter(concept => concept.estado === 'active');
      setSubdependencias(activeConcepts2);
    } catch (error) {
      console.error('Error al cargar subdependencias:', error);
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.unidad==='' || formData.dependencia==='' || formData.costo==='' || (formData.dependencia === 'Coordinación de Salud' && formData.subdependencia==='')) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Requeridos',
        text: 'Por favor, completa todos los campos requeridos antes de enviar.',
      });
      return; // Detener la ejecución de la función aquí
    }
    try {
      const response = await axios.post('saveConcepts.php', formData);
      console.log(response.data)
      if (response.data.result) {
        console.log('Respuesta del servidor:', response.data);
        Swal.fire({
          position: "center",
          icon: "success",
          title: "El concepto ha sido registrado correctamente",
          showConfirmButton: false,
          timer: 1500
        });
      }
      else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'El concepto ya ha sido registrado',
        });
      }
      // Aquí puedes manejar la respuesta, como resetear el formulario o mostrar un mensaje
    } catch (error) {
      console.error('Error al enviar los datos al servidor:', error);
      // Manejar el error, como mostrar un mensaje al usuario
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
        {formData.dependencia === 'Coordinacíon de Salud' && (
          <label>
            Subdependencia:
            <select name="subdependencia" required value={formData.subdependencia} onChange={handleChange}>
              <option value="">Seleccione una subdependencia</option>
              {subdependencias.map((sub) => (
                <option key={sub.id} value={sub.subdependencia}>
                  {sub.subdependencia}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          Servicio:
          <input type="text" name="servicio" required value={formData.servicio} onChange={handleChange} />
        </label>
        <label>
          Costo:
          <input type="text" name="costo" required value={formData.costo} onChange={handleChange} />
        </label>

        <label>
          ¿Se podra pagar a plazos?:   
          <input type="checkbox" name="plazos" checked={formData.plazos} onChange={handleChange} />
          <span>{formData.plazos ? 'Sí' : 'No'}</span>
        </label>
        <input type="submit" value="Guardar" />
      </form>
    </div>
  );
};

export default ConceptForm;
