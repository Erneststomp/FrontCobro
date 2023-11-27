import React, { useState } from 'react';
import axios from '../../axiosConfig.js';
import DynamicTable from '../Tabla/Tabla.js';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

const ReporteDeGastos = () => {

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = `${today.getMonth() + 1}`.padStart(2, '0'); // Añadir un cero si es necesario
    const day = `${today.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [gastosData, setGastosData] = useState([]);
  const [fecha, setFecha] = useState(getCurrentDate());
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('diario');
  const [isDownloadable, setIsDownloadable] = useState(false);

  const columns = [
    { headerName: "Usuario", field: "user" },
    { headerName: "Dependencia", field: "dependencia" },
    { headerName: "Cliente", field: "cliente" },
    { headerName: "Conceptos", field: "conceptos" },
    { headerName: "Total", field: "total" },
    { headerName: "Abono", field: "abono" },
    { headerName: "Adeudo", field: "adeudo" },
    { headerName: "Fecha", field: "fecha" },
    { headerName: "Folio", field: "folio" },
    { headerName: "Estado", field: "estado" },
  ];
  const [resumenData, setResumenData] = useState({
    totalSolicitudes: 0,
    valorTotalFactura: 0,
    valorTotalPagado: 0,
    valorTotalAPagar: 0,
    conceptosActivos: 0,
    conceptosCancelados: 0
  });  
  
  const fetchGastos = async () => {
    // Preparar el objeto con los datos a enviar
    const dataToSend = {
      periodo: filtroPeriodo,
    };
  
    if (filtroPeriodo === 'diario') {
      if (!fecha) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Por favor selecciona una fecha!",
          });
        return;
      }
      dataToSend.fecha = fecha;
    } else {
      if (!fechaInicio || !fechaFin) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Por favor selecciona un rango de fechas!",
          });
        return;
      }
      dataToSend.fechaInicio = fechaInicio;
      dataToSend.fechaFin = fechaFin;
    }
  
    try {
      const response = await axios.post('getReport.php', dataToSend);
      const parsedResponse = await response.data;
      if (parsedResponse.result) {
        const ventas = parsedResponse.ventas || [];
        setGastosData(ventas);
        if (ventas.length > 0) {
          actualizarResumen(ventas);
          setIsDownloadable(true);
        } else {
          setIsDownloadable(false);
        }
      } else {
        console.error('Error al cargar los gastos:', parsedResponse.msg);
        setIsDownloadable(false);
      }
    } catch (error) {
      console.error('Error al cargar los gastos:', error);
      setIsDownloadable(false);
    }
  };
  const actualizarResumen = (gastos) => {
    let conceptosActivos = 0;
    let conceptosCancelados = 0;
    let valorTotalFactura = 0;
    let valorTotalAPagar = 0;
    let valorTotalPagado = 0;
  
    gastos.forEach(gasto => {
      if (gasto.estado === 'active') {
        conceptosActivos++;
        valorTotalFactura += Number(gasto.total);
        valorTotalAPagar += Number(gasto.adeudo);
      } else if (gasto.estado === 'inactive') {
        conceptosCancelados++;
      }
    });
  
    valorTotalPagado = valorTotalFactura - valorTotalAPagar;
  
    setResumenData({
      totalSolicitudes: gastos.length,
      valorTotalFactura,
      valorTotalPagado,
      valorTotalAPagar,
      conceptosActivos,
      conceptosCancelados
    });
  };
  
  const exportToExcel = () => {
    // Convertir los datos actuales a una hoja de cálculo
    const ws = XLSX.utils.json_to_sheet(gastosData);
  
    // Agregar fila adicional con los totales
    const totalRow = {
      conceptos: 'Ingresos totales',
      abono: resumenData.valorTotalPagado, // Valor total pagado
      otro:'Pendiente de pago',
      adeudo: resumenData.valorTotalAPagar, // Valor total a pagar
    };
  
    // Añadir esta fila al final de la hoja
    XLSX.utils.sheet_add_json(ws, [totalRow], { skipHeader: true, origin: -1 });
  
    // Crear un nuevo libro y añadir la hoja
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
  
    // Guardar el libro como un archivo Excel
    XLSX.writeFile(wb, "ReporteDeGastos.xlsx");
  };
  
  
  
  const renderResumenTable = () => (
    <div>
      <h3>Resumen</h3>
      <table>
        <tbody>
          <tr>
            <td>Cantidad de Solicitudes</td>
            <td>{resumenData.totalSolicitudes}</td>
          </tr>
          <tr>
            <td>Conceptos Activos</td>
            <td>{resumenData.conceptosActivos}</td>
          </tr>
          <tr>
            <td>Conceptos Cancelados</td>
            <td>{resumenData.conceptosCancelados}</td>
          </tr>
          <tr>
            <td>Valor Total Factura (Activos)</td>
            <td>{resumenData.valorTotalFactura}</td>
          </tr>
          <tr>
            <td>Valor Total Pagado (Activos)</td>
            <td>{resumenData.valorTotalPagado}</td>
          </tr>
          <tr>
            <td>Valor Total a Pagar (Activos)</td>
            <td>{resumenData.valorTotalAPagar}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
  
  return (
    <div className='Main-div'>
      <div>
        <h2>Reporte de Detallado</h2>
          <div className="form-group">
            <label>
              Seleccionar Periodo:
              <select value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)}>
                <option value="diario">Diario</option>
                <option value="rango">Rango</option>
              </select>
            </label>
            {filtroPeriodo === 'diario' ? (
              <div>
                <label>
                  Seleccionar Fecha:
                  <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                </label>
              </div>
            ) : (
              <div>
                <label>
                  Fecha de Inicio:
                  <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                </label>
                <label>
                  Fecha de Fin:
                  <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                </label>
              </div>
            )}
          </div>
        <div>
        <button onClick={fetchGastos}>Generar Reporte</button>
          {isDownloadable && (
            <button onClick={exportToExcel}>Descargar Reporte</button>
            )}
        </div>
        {gastosData.length > 0 ? (
            <>
              <DynamicTable data={gastosData} columns={columns} />
              {renderResumenTable()}
            </>
          ) : (
            <p>No hay registros para esta fecha.</p>
        )}

      </div>
    </div>
  );
};

export default ReporteDeGastos;
