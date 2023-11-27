import React, { useState } from 'react';
import axios from '../../axiosConfig.js';
import DynamicTable from '../Tabla/Tabla.js';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

const ReporteDeGastos = () => {
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = `${today.getMonth() + 1}`.padStart(2, '0'); 
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
    { headerName: "Conceptos", field: "conceptos" },
    { headerName: "Cantidad de Solicitudes", field: "cantidadS" },
    { headerName: "Total", field: "total" },
    { headerName: "Abono", field: "abono" },
    { headerName: "Adeudo", field: "adeudo" },
  ];

  const [resumenData, setResumenData] = useState({
    totalSolicitudes: 0,
    valorTotalFactura: 0,
    valorTotalPagado: 0,
    valorTotalAPagar: 0,
    cancelados:0
  });

  const fetchGastos = async () => {
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
      if (parsedResponse.result && parsedResponse.ventas) {
        const agrupadosPorConcepto = agruparPorConcepto(parsedResponse.ventas);
        setGastosData(agrupadosPorConcepto);
        actualizarResumen(agrupadosPorConcepto);
        setIsDownloadable(true);
      } else {
        console.error('Error al cargar los gastos:', parsedResponse.msg);
      }
    } catch (error) {
      console.error('Error al cargar los gastos:', error);
    }
  };
  
  const agruparPorConcepto = (ventas) => {
    const agrupados = {};
    let totalSolicitudes = 0;
    let cancelados = 0;
    let activas=0;
  
    ventas.forEach((venta) => {
      totalSolicitudes += 1; 
      if (venta.estado === 'inactive') {
        cancelados += 1;
        return;
      }else{
        activas+=1;
      }
  
      if (!agrupados[venta.conceptos]) {
        agrupados[venta.conceptos] = {
          ...venta,
          cantidadS: 1,
          total: Number( venta.total ), 
          abono: Number(venta.abono),
          adeudo: Number(venta.adeudo)
        };
      } else {
        agrupados[venta.conceptos].cantidadS += 1;
        agrupados[venta.conceptos].total += Number(venta.total); 
        agrupados[venta.conceptos].abono += Number(venta.abono);
        agrupados[venta.conceptos].adeudo += Number(venta.adeudo);
      }
    });
  
    setResumenData(prevState => ({
      ...prevState,
      totalSolicitudes: totalSolicitudes,
      cancelados:cancelados,
      activas:activas
    }));
  
    return Object.values(agrupados);
  };


  const actualizarResumen = (gastos) => {
    // La suma total de solicitudes ya se maneja en agruparPorConcepto
    const valorTotalFactura = gastos.reduce((acc, gasto) => acc + Number(gasto.total), 0);
    const valorTotalAPagar = gastos.reduce((acc, gasto) => acc + Number(gasto.adeudo), 0);
    const valorTotalPagado = valorTotalFactura - valorTotalAPagar;

    setResumenData(prevState => ({
      ...prevState,
      valorTotalFactura,
      valorTotalPagado,
      valorTotalAPagar
    }));
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
          <td>Solicitudes Canceladas</td>
          <td>{resumenData.cancelados}</td>
        </tr>
        <tr>
          <td>Solicitudes Activas</td>
          <td>{resumenData.cancelados}</td>
        </tr>
        <tr>
          <td>Valor Total Factura</td>
          <td>{resumenData.valorTotalFactura}</td>
        </tr>
        <tr>
          <td>Valor Total Pagado</td>
          <td>{resumenData.valorTotalPagado}</td>
        </tr>
        <tr>
          <td>Valor Total a Pagar</td>
          <td>{resumenData.valorTotalAPagar}</td>
        </tr>

      </tbody>
    </table>
  </div>
);
  
  return (
    <div className='Main-div'>
      <div>
        <h2>Reporte Simple</h2>
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
        <button onClick={fetchGastos}>Generar Reporte</button>
        {isDownloadable && (
          <button onClick={exportToExcel}>Exportar a Excel</button>
        )}

        {gastosData.length > 0 ? (
            <>
              <DynamicTable data={gastosData} columns={columns} />
              {renderResumenTable()}
            </>
          ) : (
            <p>No hay registros para mostrar.</p>
        )}

      </div>
    </div>
  );
};

export default ReporteDeGastos;
