import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig.js';
import DynamicTable from '../Tabla/Tabla.js';
import Swal from 'sweetalert2';
import { pdf } from '@react-pdf/renderer';
import MiDocumentoPDF from '../GenerarRecibo/generarrecibo.js'; 

const CobrosRealizados = ({userdata}) => {

  const [ventasData, setVentasData] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroTelefono, setFiltroTelefono] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('active'); 
  const [filtroFolio, setFiltroFolio] = useState('');

  const columns = [
    { headerName: "ID", field: "id" },
    { headerName: "Unidad", field: "unidad" },
    { headerName: "Dependencia", field: "dependencia" },
    { headerName: "Usuario", field: "user" },
    { headerName: "Cliente", field: "cliente" },
    { headerName: "Número de Contacto", field: "numero_contacto" },
    { headerName: "Conceptos", field: "conceptos" },
    { headerName: "Total", field: "total" },
    { headerName: "Abono", field: "abono" },
    { headerName: "Adeudo", field: "adeudo" },
    { headerName: "Fecha", field: "fecha" },
    { headerName: "Folio", field: "folio" },
    {headerName: "Ver Recibo",
      field: "verRecibo",
      cellRenderer: (rowData) => {
        // Función asíncrona para manejar la generación del PDF
        const handlePDFGeneration = async () => {
          try {
            const pdfBlob = await generarPDF(rowData);
            abrirPDFEnNuevaVentana(pdfBlob);
          } catch (error) {
            console.error("Error al generar el recibo:", error);
          }
        };
    
        return (
          <button onClick={handlePDFGeneration}>
            Generar Recibo
          </button>
        );
      }
    },
    {
      headerName: "Liquidar",
      field: "liquidar",
      cellRenderer: (rowData) => {
        // Revisa si el abono es igual al total para determinar si está liquidado
        if (Number(rowData.abono) === Number(rowData.total) &&Number(rowData.total)!==0 ) {
          return <span>Liquidado en: {rowData.liquidacion}</span>;
        } else if (rowData.adeudo !== '0') {
          // Si hay adeudo y no está liquidado, muestra el botón para liquidar
          return <button onClick={() => handleLiquidar(rowData)}>Liquidar</button>;
        } else {
          // Si no hay adeudo y no está liquidado, muestra "No aplicable"
          return <span>No aplicable</span>;
        }
      }
    }
    
  ];

  if (userdata.typeOfUser === 'Admin'||userdata.typeOfUser === 'Supervisor') {
    columns.push({
      headerName: "Acciones",
      field: "acciones",
      cellRenderer: (rowData) => (
        <button onClick={() => handleStatusChange(rowData.id, rowData.estado === 'active' ? 'inactive' : 'active')}>
          {rowData.estado === 'active' ? 'Cancelar' : 'Activar'}
        </button>
      )
    });
  }
  const generarPDF = async (datos) => {
    const blob = await pdf(<MiDocumentoPDF datos={datos} />).toBlob();
    return blob;
  };
  const abrirPDFEnNuevaVentana = (blob) => {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };
  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const response = await axios.get('getVentas.php');
        const parsedResponse = await response.data;
        if (parsedResponse.result) {
          setVentasData(parsedResponse.ventas || []); 
        } else {
          console.error('Error al cargar las ventas:', parsedResponse.msg);
        }
      } catch (error) {
        console.error('Error al cargar las ventas:', error);
      }
    };
    fetchVentas();
  }, [ventasData]);

  const ventasFiltradas = ventasData ? ventasData.filter(venta => 
    venta.fecha.toLowerCase().includes(filtroFecha.toLowerCase()) &&
    venta.cliente.toLowerCase().includes(filtroNombre.toLowerCase()) &&
    venta.numero_contacto.toLowerCase().includes(filtroTelefono.toLowerCase()) &&
    venta.folio.toLowerCase().includes(filtroFolio.toLowerCase()) && 
    (filtroEstado === 'todos' || (filtroEstado === 'pendiente' ? venta.adeudo !== '0' : venta.estado.toLowerCase() === filtroEstado))
  ) : [];
  

  const handleStatusChange = async (id, nuevoEstado) => {
    try {
      let titulo = "Realmente quiere eliminar esta transaccion?";
      let comentario = 'La transaccion fue eliminada';
      if (nuevoEstado === 'active') {
        titulo = 'Realmente quieres reactivar esta transaccion?';
        comentario = 'La transaccion fue reactivada';
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
            tabla: 'registroventas',
            notas: motivo  
          });

          if (response.data.result) {
            Swal.fire(comentario, "", "success");
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


  const handleLiquidar = async (datosFila) => {
    // Verificar si se ha abonado el total faltante
    const faltante = datosFila.total - datosFila.abono;
    const mensajeConfirmacion = faltante > 0 
      ? `¿Está seguro de que desea liquidar el adeudo faltante de $${faltante}.00?`
      : "¿Está seguro de que desea liquidar este adeudo?";
  
    // Mostrar SweetAlert para confirmación
    const result = await Swal.fire({
      title: 'Confirmar Liquidación',
      text: mensajeConfirmacion,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, liquidar',
      cancelButtonText: 'Cancelar'
    });
  
    // Si se confirma la liquidación
    if (result.isConfirmed) {
      try {
        const response = await axios.put('liquidarAdeudo.php', datosFila);
        if (response.data.result) {
          Swal.fire("Adeudo liquidado", "", "success");
        } else {
          Swal.fire("Error al liquidar", "", "error");
        }
      } catch (error) {
        console.error('Error al liquidar el adeudo:', error);
      }
    }else{
      Swal.fire("No se aplico la liquidación", "", "warning");
    }
  };
  
  
  return (
    <div className='Main-div'>
      <div>
        <h2>Registro de Ventas</h2>
        <div className="form-group">
          <label>
            Filtrar por Fecha:
            <input type="text" value={filtroFecha}onChange={(e) => setFiltroFecha(e.target.value)}/>
          </label>
          <label>
            Filtrar por Nombre:
            <input type="text" value={filtroNombre}onChange={(e) => setFiltroNombre(e.target.value)}/>
          </label>
          <label>
            Filtrar por Teléfono:
            <input type="text" value={filtroTelefono}onChange={(e) => setFiltroTelefono(e.target.value)}/>
          </label>
        </div>
          <div>
            <label>
              Filtrar por Estado:
              <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                <option value="todos">Todos</option>
                <option value="active">Activo</option>
                <option value="inactive">Cancelado</option>
                <option value="modificado">Modificado</option>
                <option value="pendiente">Pendiente de pago</option>
              </select>
            </label>
            <label>
              Filtrar por Folio:
              <input type="text" value={filtroFolio} onChange={(e) => setFiltroFolio(e.target.value)} />
            </label>
          </div>
          <DynamicTable data={ventasFiltradas} columns={columns} />
      </div>
    </div>
  );
};

export default CobrosRealizados;
