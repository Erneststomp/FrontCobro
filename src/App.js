import './App.css';
import NavBar from './Components/NabBar/NavBar';
import Index from './Components/Index/Index.js';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import AddUsers from './Components/AgregarUsuarios/AgregarUsuarios';
import AddConcepts from './Components/AgregarConcepts/AgregarConceptos';
import Cobros from './Components/Cobros/Cobros';
import NewCobro from './Components/NuevoCobro/NuevoCobro.js';
import ConcetosRegistrados from './Components/VerConceptos/VerConceptos.js'
import Login from './Components/Login/Login.js';
import Dependences from './Components/AgregarDependencias/AgregarDep.js';
import Unidades from './Components/AgregarUnidades/AgregarUnidades.js';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from './axiosConfig.js'
import GetUsuarios from './Components/VerUsuarios/VerUsuarios.js'
import Reporte from './Components/Reporte/Reporte.js'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ typeOfUser: '',nombre:'', unidad:'' , dependencia:'', email:'' });
  useEffect(() => {
    const storedLoggedIn = Cookies.get('isLoggedIn');  
    const storedUser = Cookies.get('user');  
    if (storedLoggedIn === 'true') {
      setIsLoggedIn(true);
      if (storedUser) {
        setUser(JSON.parse(storedUser)); 
      }else{
        setIsLoggedIn(false);
      }
    }
  }, []);

  useEffect(() => {
    const iniciarAplicacion = async () => {
        try {
            const response = await axios.get('onstart.php');
            console.log(response )
        } catch (error) {
            console.error('Error al iniciar la aplicación:', error);
        }
    };

    iniciarAplicacion();
}, []);

  return (
    <BrowserRouter>
      <div className="App">
        <NavBar setIsLoggedIn={setIsLoggedIn} userdata={user} />
        <Routes>
          <Route path='/' element={<Index />} />
          <Route path='/Login' element={!isLoggedIn ? <Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} /> : <Navigate to="/" />} />
          {isLoggedIn ? (
            <>
              <Route path='/' element={<Index />} />
              <Route path='/NewPay'  element={<NewCobro userdata={user}/>} />
              <Route path='/Unidad' element={<Unidades />} />
              <Route path='/Dependencias' element={<Dependences />} />
              <Route path='/AddUsers' element={<AddUsers />} />
              <Route path='/getConceptos' element={<ConcetosRegistrados />} />
              <Route path='/AddConcepts' element={<AddConcepts />} />
              <Route path='/getUsuarios' element={<GetUsuarios />} />
              <Route path='/Cobros' element={<Cobros userdata={user}/>} />
              <Route path='/ReporteDetallado' element={<Reporte/>} />
            </>
          ) : (
            <Route path='*' element={<Navigate to="/Login" />} />
          )}
        </Routes>
      </div>
    </BrowserRouter>
  );
}


export default App;