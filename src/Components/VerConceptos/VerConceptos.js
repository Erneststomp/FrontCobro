import React, { useEffect, useState } from 'react';
import './VerConceptos.css';
import axios from '../../axiosConfig.js'
import DynamicTable from '../Tabla/Tabla.js'
import Swal from 'sweetalert2';
const Intro = () => {
  const [conceptData, setConceptData] = useState(null);
  const [filterUnit, setFilterUnit] = useState('');  
  const [unidades, setUnidades] = useState([]);
  const [filterDependencia, setFilterDependencia] = useState('');
  const [dependencias, setDependencias] = useState([]); 
  const columns = [
    { headerName: "ID", field: "id" },
    { headerName: "Unidad", field: "unidad" },
    { headerName: "Dependencia", field: "dependencia" },
    { headerName: "Servicio", field: "servicio" },
    { headerName: "Costo", field: "costo" },
    { headerName: "Opción a Plazos", field: "plazos" },
    { headerName: "Estado", field: "estado" },
    { headerName: "Acciones", field: "acciones",
    cellRenderer: (rowData) => (
      <button onClick={() => handleStatusChange(rowData.id, rowData.estado === 'active' ? 'inactive' : 'active')}>
        {rowData.estado === 'active' ? 'Desactivar' : 'Activar'}
      </button>
    )
  }
  ];
  useEffect(() => {
    const fetchData = async () => {
      try {
            
        const response = await axios.get('getConcepts.php')
        const parsedResponse = response.data;
        setConceptData(parsedResponse.conceptos);

        // Cargar unidades
        const resUnidades = await axios.get('getUnidades.php')
        const parsedResponse1 = resUnidades.data;
        setUnidades(parsedResponse1.unidades);

        const resDependencias = await axios.get('getDependencias.php'); // Asegúrate de tener la URL correcta
        const parsedResponse3 = resDependencias.data;
        setDependencias(parsedResponse3.dependencias);

      } catch (error) {
        console.error('Error al cargar los conceptos:', error);
      }
    };

    fetchData();
  }, []);
  
  const handleStatusChange = async (id, nuevoEstado) => {
    try {
     
      let titulo="Realmente quiere eliminar este Concepto?"
      let comentario='El Concepto fue reactivado'
      if(nuevoEstado==='active'){
        titulo='Realmente quieres reactivar este Concepto?'
        comentario='El concetpo fue desactivado'
      }
      Swal.fire({
        title: titulo,
        showDenyButton: true,
        confirmButtonText: "Si",
        denyButtonText: `No`
      }).then(async(result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          const response = await axios.post('cambiarEstado.php', { id, estado: nuevoEstado, tabla:'conceptosdecobro' });
          if (response.data.result) {
               Swal.fire(comentario, "", "success");
               const updatedUsersResponse = await axios.get('getConcepts.php');
               if (updatedUsersResponse.data) {
                   setConceptData(updatedUsersResponse.data.conceptos);
               }
          } else {
          }
        } else if (result.isDenied) {
          Swal.fire("No se ha eliminado", "", "info");
        }
      }); 
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
    }
  };

  // Función para aplicar el filtro de unidad
  const applyFilter = () => {
    let filteredData = conceptData;
    if (filterUnit) {
      filteredData = filteredData.filter(concept => concept.unidad === filterUnit);
    }
    if (filterDependencia) {
      filteredData = filteredData.filter(concept => concept.dependencia === filterDependencia);
    }
    return filteredData;
  };


  return (
    <div className='Main-div'>
      <h2>Conceptos Registrados</h2>
      <div>
        {/* Agrega un elemento de filtro (puede ser un menú desplegable o una caja de texto) */}
        <div className="form-group">
          <label>Filtrar por Unidad:
            <select onChange={(e) => setFilterUnit(e.target.value)}>
              <option value="">Todas</option>
              {unidades.map((unidad) => (
                <option key={unidad.id} value={unidad.unidad}>
                  {unidad.unidad}
                </option>
              ))}
            </select>
          </label>
          <label>Filtrar por Dependencia:
            <select onChange={(e) => setFilterDependencia(e.target.value)}>
              <option value="">Todas</option>
              {dependencias.map((dependencia) => (
                <option key={dependencia.id} value={dependencia.dependencia}>
                  {dependencia.dependencia}
                </option>
              ))}
            </select>
          </label>
        </div>
        {conceptData && conceptData.length > 0 ? (
          <DynamicTable data={applyFilter()} columns={columns} />
        ) : (
          <p>aun no ha Registrado ningun concepto.</p>
        )}
      </div>
    </div>
  );
  
}

export default Intro;
