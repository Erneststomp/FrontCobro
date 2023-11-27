import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig.js';
import DynamicTable from '../Tabla/Tabla.js'
import Swal from 'sweetalert2';

const AddDependence = () => {
  const [formData, setFormData] = useState({
    dependencia: ''
  });

const columns = [
    { headerName: "ID", field: "id" },
    { headerName: "Dependencia", field: "dependencia" },
    { headerName: "Estado", field: "estado" },
    { headerName: "Acciones", field: "acciones",
      cellRenderer: (rowData) => (
        <button onClick={() => handleStatusChange(rowData.id, rowData.estado === 'active' ? 'inactive' : 'active')}>
          {rowData.estado === 'active' ? 'Desactivar' : 'Activar'}
        </button>
      )
    }
  ];

  const [dependencias, setDependencias] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleStatusChange = async (id, nuevoEstado) => {
    try {
      let titulo = "Realmente quiere desactivar esta Dependencia?";
      let comentario = 'El usuario fue eliminado';
      if (nuevoEstado === 'active') {
        titulo = 'Realmente quieres reactivar esta Dependencia?';
        comentario = 'El usuario fue reactivado';
      }

      const { isConfirmed } = await Swal.fire({
        title: titulo,
        showDenyButton: true,
        confirmButtonText: "Si",
        denyButtonText: `No`
      });

      if (isConfirmed) {
        const { value: motivo } = await Swal.fire({
          title: 'Ingrese el motivo',
          input: 'textarea',
          inputPlaceholder: 'Escribe el motivo aquí...',
          inputAttributes: {
            'aria-label': 'Escribe el motivo aquí'
          },
          showCancelButton: true,
          confirmButtonText: 'Enviar',
          cancelButtonText: 'Cancelar'
        });

        if (motivo) {
          const response = await axios.post('cambiarEstado.php', {
            id, 
            estado: nuevoEstado, 
            tabla: 'dependencias',
            notas: motivo 
          });
          if (response.data.result) {
            Swal.fire(comentario, "", "success");
            const updatedUsersResponse = await axios.get('getDependencias.php');
            if (updatedUsersResponse.data) {
              setFormData(updatedUsersResponse.data.dependencias);
            }
          }
        } else {
          Swal.fire("Cancelación sin motivo", "", "info");
        }
      } else{
        Swal.fire("No se ha eliminado", "", "info");
      }
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar dependencias
        const resDependencias = await axios.get('getDependencias.php');
        const parsedResponse = resDependencias.data;
        setDependencias(parsedResponse.dependencias);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };
    cargarDatos();
  },  [dependencias]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Enviar los datos al servidor PHP utilizando Axios
    try {
      const response= await axios.post('addDependencias.php',formData);
      if (response.data.result) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "La dependencia ha sido registrada correctamente",
          showConfirmButton: false,
          timer: 1500
        });
        
      }
      else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'La dependencia ya ha sido registrada ',
        });
      }



    } catch (error) {
      console.error('Error al enviar los datos al servidor:', error);
    }
  };

  return (
    <div className='Main-div'>
      <h2>Agregar Nueva Dependencia</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Dependencia:
          <input type="text" name="dependencia" required value={formData.dependencia} onChange={handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
      <br></br>
      <div className="dependencias-registradas">
        <h2>Dependencias Registradas</h2>
          {dependencias && dependencias.length > 0 ? (
            <DynamicTable data={dependencias} columns={columns} />
          ) : (
            <p>aun no ha Registrado ningun concepto.</p>
          )}
      </div>
    </div>
  );
};

export default AddDependence;
