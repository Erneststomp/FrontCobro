import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig.js';
import DynamicTable from '../Tabla/Tabla.js'
import Swal from 'sweetalert2';

const AddSubDependence = () => {
  const [formDataS, setFormDatas] = useState({
    subdependencia: ''
  });

const columns = [
    { headerName: "ID", field: "id" },
    { headerName: "Subdependencia", field: "subdependencia" },
    { headerName: "Estado", field: "estado" },
    { headerName: "Acciones", field: "acciones",
      cellRenderer: (rowData) => (
        <button onClick={() => handleStatusChangeS(rowData.id, rowData.estado === 'active' ? 'inactive' : 'active')}>
          {rowData.estado === 'active' ? 'Desactivar' : 'Activar'}
        </button>
      )
    }
  ];

  const [subdependencias, setSubdependencias] = useState([]);

  const handleChangeS = (e) => {
    const { name, value } = e.target;
    setFormDatas({
      ...formDataS,
      [name]: value,
    });
  };
  
  const handleStatusChangeS = async (id, nuevoEstado) => {
    try {
      let titulo = "Realmente quiere desactivar esta Subependencia?";
      let comentario = 'La Subdependencia fue eliminada';
      if (nuevoEstado === 'active') {
        titulo = 'Realmente quieres reactivar esta Subdependencia?';
        comentario = 'La Subdependencia fue reactivada';
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
            tabla: 'subdependencias',
            notas: motivo 
          });
          if (response.data.result) {
            Swal.fire(comentario, "", "success");
            const updatedUsersResponse = await axios.get('getSubdependencias.php');
            if (updatedUsersResponse.data) {
              setFormDatas(updatedUsersResponse.data.subdependencias);
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
    const cargarDatosSub = async () => {
      try {
        // Cargar subdependencias
        const resDependencias = await axios.get('getSubdependencias.php');
        const parsedResponse = resDependencias.data;
        setSubdependencias(parsedResponse.subdependencias);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };
    cargarDatosSub();
  },  [subdependencias]);

  const handleSubmitS = async (e) => {
    e.preventDefault();
    // Enviar los datos al servidor PHP utilizando Axios
    try {
      const response= await axios.post('addSubdependencias.php',formDataS);
      if (response.data.result) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "La subdependencia ha sido registrada correctamente",
          showConfirmButton: false,
          timer: 1500
        });
        
      }
      else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'La subdependencia ya ha sido registrada ',
        });
      }



    } catch (error) {
      console.error('Error al enviar los datos al servidor:', error);
    }
  };

  return (
    <div className='Main-div'>
      <h2>Agregar Nueva Dependencia</h2>
      <form onSubmit={handleSubmitS}>
        <label>
          Subependencia:
          <input type="text" name="subdependencia" required value={formDataS.subdependencia} onChange={handleChangeS} />
        </label>
        <input type="submit" value="Submit" />
      </form>
      <br></br>
      <div className="subdependencias-registradas">
        <h2>Dependencias Registradas</h2>
          {subdependencias && subdependencias.length > 0 ? (
            <DynamicTable data={subdependencias} columns={columns} />
          ) : (
            <p>aun no ha Registrado ningun concepto.</p>
          )}
      </div>
    </div>
  );
};

export default AddSubDependence;
