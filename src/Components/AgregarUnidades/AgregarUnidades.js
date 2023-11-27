import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig.js';
import DynamicTable from '../Tabla/Tabla.js'
import Swal from 'sweetalert2';

const AddUnity = () => {
  const [formData, setFormData] = useState({
    unidad: ''
  });

  const columns = [
    { headerName: "ID", field: "id" },
    { headerName: "Unidad", field: "unidad" },
    { headerName: "Estado", field: "estado" },
    { headerName: "Acciones", field: "acciones",
      cellRenderer: (rowData) => (
        <button onClick={() => handleStatusChange(rowData.id, rowData.estado === 'active' ? 'inactive' : 'active')}>
          {rowData.estado === 'active' ? 'Desactivar' : 'Activar'}
        </button>
      )
    }
  ];

  const [unidades, setUnidades] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar unidades
        const resUnidades = await axios.get('getUnidades.php');
        const parsedResponse1 = resUnidades.data;
        setUnidades(parsedResponse1.unidades);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    cargarDatos();
  },  [unidades]);

  const handleStatusChange = async (id, nuevoEstado) => {
    try {
      let titulo = "Realmente quiere desactivar esta Unidad?";
      let comentario = 'El usuario fue eliminado';
      if (nuevoEstado === 'active') {
        titulo = 'Realmente quieres reactivar esta Unidad?';
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
            tabla: 'unidades',
            notas: motivo 
          });
          if (response.data.result) {
            Swal.fire(comentario, "", "success");
            const updatedUsersResponse = await axios.get('getUnidades.php');
            if (updatedUsersResponse.data) {
              setFormData(updatedUsersResponse.data.unidades);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response= await axios.post('addUnidades.php',formData);
          if (response.data.result) {
            console.log('Respuesta del servidor:', response.data);
            Swal.fire({
              position: "center",
              icon: "success",
              title: "La Unidad ha sido registrada correctamente",
              showConfirmButton: false,
              timer: 1500
            });
          }
          else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'La unidad ya ha sido registrada ',
            });
          }

      
    } catch (error) {
      console.error('Error al enviar los datos al servidor:', error);
    }
  };

  return (
    <div className='Main-div'>
      <h2>Agregar Nueva Unidad</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Unidad:
          <input type="text" name="unidad" required value={formData.unidad} onChange={handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
      <br></br>
      <div className="unidades-registradas">
        <h2>Unidades Registradas</h2>
          {unidades && unidades.length > 0 ? (
            <DynamicTable data={unidades} columns={columns} />
          ) : (
            <p>aun no ha Registrado ningun concepto.</p>
          )}
      </div>
    </div>
  );
};

export default AddUnity;
