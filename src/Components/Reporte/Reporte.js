import React, { useState } from 'react';
import ReporteSimple from './ReporteSimple';
import ReporteDetallado from './ReporteDetallado';

const Reporte = () => {
  const [reporteActual, setReporteActual] = useState(null); // Inicializado como null

  const renderReporte = () => {
    switch(reporteActual) {
      case 'simple':
        return <ReporteSimple />;
      case 'detallado':
        return <ReporteDetallado />;
      default:
        return <div>Seleccione un tipo de reporte</div>;
    }
  };

  return (
    <div>
      <h2>Reportes</h2>
      <button onClick={() => setReporteActual('simple')}>Ver Reporte Simple</button>
      <button onClick={() => setReporteActual('detallado')}>Ver Reporte Detallado</button>

      {renderReporte()}
    </div>
  );
};

export default Reporte;
