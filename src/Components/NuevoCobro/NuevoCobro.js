import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig.js';
import './nuevocobro.css'
import Swal from 'sweetalert2'
import { pdf } from '@react-pdf/renderer';
import MiDocumentoPDF from '../GenerarRecibo/generarrecibo.js'; 

const Cobro = ({ userdata }) => { 
  const [conceptData, setConceptData] = useState([]);
  const [filteredConcepts, setFilteredConcepts] = useState([]);
  const [selectedConcept, setSelectedConcept] = useState('');
  const [allowPlazos, setAllowPlazos] = useState(false);
  const [formData, setFormData] = useState({
    unidad: userdata.unidad, 
    dependencia: userdata.dependencia, 
    user: userdata.nombre,
    cliente: '',
    numero_contacto: '',
    concepto:'',
    total: 0,
    abono: 0,
    adeudo: 0
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "numero_contacto" && !/^\d*$/.test(value)) {
      return;
    }
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handlePlazosChange = (e) => {
    setAllowPlazos(e.target.checked);
    if (!e.target.checked) {
      setFormData({ ...formData, abono: 0, adeudo: 0 });
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('getConcepts.php');
        const parsedResponse = response.data;
        // Verifica si parsedResponse.conceptos existe y no está vacío
        if (parsedResponse.conceptos && parsedResponse.conceptos.length > 0) {
          const activeConcepts = parsedResponse.conceptos.filter(concept => concept.estado === 'active');
          setConceptData(activeConcepts);
        }
      } catch (error) {
        console.error('Error al cargar los conceptos:', error);
      }
    };
    fetchData();
  }, []);
  
  useEffect(() => {
    // Asegúrate de que conceptData no esté vacío
    if (conceptData && conceptData.length > 0) {
      const filtered = conceptData.filter(concept => 
        concept.unidad === formData.unidad && concept.dependencia === formData.dependencia
      );
      setFilteredConcepts(filtered);
    } else {
      setFilteredConcepts([]);
    }
  }, [conceptData, formData.unidad, formData.dependencia]);
  
  

  useEffect(() => {
    if (selectedConcept && filteredConcepts && filteredConcepts.length > 0) {
      const selected = filteredConcepts.find(concept => concept.id === selectedConcept);
      setFormData(prevFormData => ({
        ...prevFormData,
        total: selected ? selected.costo : 0,
      }));
    }
  }, [selectedConcept, filteredConcepts]);
  

  const handleConceptChange = (e) => {
    const conceptId = e.target.value;
    setSelectedConcept(conceptId);
    const concept = conceptData.find(c => c.id === conceptId);
    if (concept) {
      setFormData({
        ...formData,
        concepto: concept.servicio,
      });
      if (concept.plazos) {
        setAllowPlazos(true);
      } else {
        setAllowPlazos(false);
      }
    } else {
      setFormData({
        ...formData,
        concepto: '',
      });
      setAllowPlazos(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedConcept) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, seleccione un concepto.',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      return;
    }
  
    // Verificar la longitud del número de contacto
    if (formData.numero_contacto.length !== 10) {
      Swal.fire({
        title: 'Error',
        text: 'El número de contacto debe tener 10 dígitos.',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      return;
    }
    try {
      const response = await axios.post('savePurchase.php', formData);
      if (response.data.result) {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Se ha registrado la compra",
          showConfirmButton: false,
          timer: 1500
        }).then(async() => {
          const pdfBlob = await generarPDF(response.data.data[0]);
          abrirPDFEnNuevaVentana(pdfBlob);
        });
      }
    } catch (error) {
      console.error('Error al enviar los datos al servidor:', error);
    }
  };

  const generarPDF = async (datos) => {
    const blob = await pdf(<MiDocumentoPDF datos={datos} />).toBlob();
    return blob;
  };
  const abrirPDFEnNuevaVentana = (blob) => {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };
  
  
  return (
    <div className='Main-div'>
      <form onSubmit={handleSubmit}>
        <label className='Titulo'>DIF Municipal Zinacantepec</label>
        <div className="form-group">
          <label>
            Unidad:
            <input type="text" name="unidad" value={formData.unidad} readOnly />
          </label>
          <label>
            Dependencia:
            <input type="text" name="dependencia" value={formData.dependencia} readOnly />
          </label>
        </div>
        <label>
          Atendio:
          <input type="text" name="user" value={formData.user} readOnly
          />
        </label>
        <label>Datos del Solicitante:</label>
        <div className="form-group">
          <label>
            Nombre:
            <input type="text" name="cliente" required value={formData.cliente} onChange={handleChange} />
          </label>
          <label>
            Numero de Contacto:
            <input 
              type="tel" 
              name="numero_contacto" 
              required 
              value={formData.numero_contacto} 
              onChange={handleChange} 
              maxLength="10"
              pattern="\d{10}"
            />
          </label>
        </div>
        <label>Concepto:
          <select name="concepto" value={selectedConcept} onChange={handleConceptChange}>
            <option value="">Seleccione un concepto</option>
            {filteredConcepts.map(concept => (
              <option key={concept.id} value={concept.id}>
                {concept.servicio}
              </option>
            ))}
          </select>
        </label>
        <label>
          Total:
          <input type="number" required name="total" value={formData.total} readOnly
          />
        </label>
        {selectedConcept && filteredConcepts.find(concept => concept.id === selectedConcept)?.plazos && (
          <label>
            ¿Desea Pagar a plazos?    
            <input 
              type="checkbox" 
              className="plazos-checkbox"
              checked={allowPlazos} 
              onChange={handlePlazosChange}
            />
          </label>
        )}
        {allowPlazos && (
          <>
            <label>
              Abono:
              <input type="number" name="abono" value={formData.abono} onChange={handleChange}
              />
            </label>
            <label>
              Adeudo:
              <input type="number" name="adeudo" value={formData.total - formData.abono} readOnly
              />
            </label>
          </>
        )}
        <input type="submit" value="Submit" />
      </form>
      
    </div>
  );
};

export default Cobro;
 