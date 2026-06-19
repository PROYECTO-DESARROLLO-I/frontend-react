import { useState } from "react";
import "./App.css";
import { GoArrowLeft } from "react-icons/go";

function CitasAdmin({ volverAlDashboard }) {
  const [formData, setFormData] = useState({
    paciente: "",
    correo: "",
    tdocumento: "",
    documento: "",
    medico: "",
    especialidad: "",
    sede: "",
    fecha: "",
    hora: "",
  });

  const agendarCita = (data) => {
  
  }
  const buscarPaciente = async() => {
    try{
      const response = await fetch(`http://localhost:8000/api/pacientes/buscar/?tdocumento=${formData.tdocumento}&documento=${formData.documento}`);
    const datos = await response.json();
    
    }
    
    catch(error){
      setMensajeError("Error al buscar paciente. Por favor, intenta nuevamente.");
  }
}

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejarEnvio = (e) => {
    e.preventDefault();

    if (!formData.paciente || !formData.correo || !formData.documento || !formData.sede || !formData.fecha || !formData.hora) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    
  };

  return (
    <div className="admin-form-page">
      <div className="admin-back" onClick={volverAlDashboard}>
        <GoArrowLeft />
        <p>Volver al Panel Administrativo</p>
      </div>

      <form className="admin-form-card" onSubmit={manejarEnvio}>
        <h2>Agendar Cita</h2>
        <p>Registra una nueva cita para un paciente.</p>

        <div className="search-patient">

          <label>Buscar Paciente</label>
          <Select
            name="Tdocumento"
            value={formData.tdocumento}
            onChange={(e) => setFormData({ ...formData, tdocumento: e.target.value })}>
            <option value="">Selecciona tipo de documento</option>
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="CE">Cédula de Extranjería</option>
            <option value="TI">Tarjeta de Identidad</option>
            <option value="PAS">Pasaporte</option>
          </Select>

          <input
            name="documento"
            type="text"
            value={formData.documento} 
            onChange={manejarCambio}
            placeholder="Número de documento"
          />
          
          <button type="button" className="admin-secondary-button" onClick={() => {buscarPaciente(formData.tdocumento, formData.documento)}}>
            Buscar
          </button>
        </div>

        <div className="admin-form-grid">

          <label>Correo Electrónico</label>
          <input
            name="correo"
            type="email"
            value={formData.correo}
            onChange={manejarCambio}
            placeholder="Correo electrónico"
          />

          <label>Medico</label>
          <select
            name="medico"
            value={formData.medico}
            onChange={manejarCambio}
          >
            <option value="">Selecciona un médico</option>
            <option value="dr-johnson">Dr. Johnson</option>
            <option value="dr-smith">Dr. Smith</option>
            <option value="dr-williams">Dr. Williams</option>
            </select>

          <label>Especialidad</label>
          <select
            name="especialidad"
            value={formData.especialidad}
            onChange={manejarCambio}
          >
            <option value="">Selecciona una especialidad</option>
            <option value="cardiologia">Cardiología</option>
            <option value="neurologia">Neurología</option>
            <option value="pediatria">Pediatria</option>
          </select>

          <label>Sede</label>
          <select
            name="sede"
            value={formData.sede}
            onChange={manejarCambio}
          >
            <option value="">Selecciona una sede</option>
            <option value="sede-1">Sede Principal</option>
            <option value="sede-2">Sede Secundaria</option>
          </select>

          <label>Fecha</label>
          <input
            name="fecha"
            type="date"
            value={formData.fecha}
            onChange={manejarCambio}
          />

          <label>Hora</label>
          <input
            name="hora"
            type="time"
            value={formData.hora}
            onChange={manejarCambio}
          />

          <button className="admin-primary-button" type="submit" onClick={() => agendarCita(formData)}>
            Guardar Cita
          </button>
        </div>
      </form>
    </div>
  );
}

export default CitasAdmin;
