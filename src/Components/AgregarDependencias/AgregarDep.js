import React, { useState } from 'react';
import Dependencias from './AgregarDependencias'
import SubDependencias from './AgregarSubDependencias';

const Reporte = () => {
  const [addDependencia, serAddDependencia] = useState('Dependencia'); // Inicializado como null

  const renderReporte = () => {
    switch(addDependencia) {
      case 'Dependencia':
        return <Dependencias />;
      case 'Subdependencia':
        return <SubDependencias />;
      default:
        return <div></div>;
    }
  };

  return (
    <div>
      <button onClick={() => serAddDependencia('Dependencia')}>Dependencias</button>
      <button onClick={() => serAddDependencia('Subdependencia')}>Subdependencias</button>
      {renderReporte()}
    </div>
  );
};

export default Reporte;
