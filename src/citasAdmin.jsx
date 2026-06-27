import { useEffect, useState } from "react";
import "./App.css";
import { GoArrowLeft, GoSearch } from "react-icons/go";

function CitasAdmin({ volverAlDashboard }) {
  const [sedes, setSedes] = useState([]);
  const [medico, setMedico] = useState([]);
  const [mensajeError, setMensajeError] = useState("");
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

  const agendarCita = () => {};

  const buscarPaciente = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/pacientes/buscar/?tdocumento=${formData.tdocumento}&documento=${formData.documento}`,
      );

      await response.json();
    } catch {
      setMensajeError("Error al buscar paciente. Por favor, intenta nuevamente.");
    }
  };

  useEffect(() => {
    const cargarSedes = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/headquarters/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setMensajeError(data.detail || "Error al cargar las sedes.");
          return;
        }

        setSedes(data);
      } catch {
        setMensajeError("Error al cargar las sedes. Por favor, intenta nuevamente.");
      }
    };

    cargarSedes();
  }, []);

useEffect(() => {
    const cargarMedico = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/medico/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setMensajeError(data.detail || "Error al cargar las medico.");
          return;
        }

        setMedico(data);
      } catch {
        setMensajeError("Error al cargar las medico. Por favor, intenta nuevamente.");
      }
    };

    cargarMedico();
  }, []);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejarEnvio = (e) => {
    e.preventDefault();

    if (
      !formData.paciente ||
      !formData.correo ||
      !formData.documento ||
      !formData.sede ||
      !formData.fecha ||
      !formData.hora
    ) {
      alert("Por favor, completa todos los campos.");
    }
  };

  return (
    <div className="admin-form-page">
      <div className="admin-back" onClick={volverAlDashboard}>
        <GoArrowLeft />
        <p>Volver al Panel</p>
      </div>

      <form className="admin-form-card" onSubmit={manejarEnvio}>
        <h2>Agendar Cita</h2>
        <p>Registra una nueva cita para un paciente.</p>

        <div className="search-patient">
          <label>Buscar Paciente</label>
          <select
            name="tdocumento"
            value={formData.tdocumento}
            onChange={manejarCambio}
          >
            <option value="">Selecciona tipo de documento</option>
            <option value="CC">Cedula de Ciudadania</option>
            <option value="CE">Cedula de Extranjeria</option>
            <option value="TI">Tarjeta de Identidad</option>
            <option value="PAS">Pasaporte</option>
          </select>

          <input
            name="documento"
            type="text"
            value={formData.documento}
            onChange={manejarCambio}
            placeholder="Numero de documento"
          />

          <button className="admin-back" type="button" onClick={buscarPaciente}>
            <GoSearch />
          </button>
        </div>

        <div className="admin-form-grid">
          <label>Correo Electronico</label>
          <input
            name="correo"
            type="email"
            value={formData.correo}
            onChange={manejarCambio}
            placeholder="Correo electronico"
          />

          <label>Medico</label>
          <select name="medico" value={formData.medico} onChange={manejarCambio}>
            <option value="">Selecciona un medico</option>
            {medico.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <label>Especialidad</label>
          <select
            name="especialidad"
            value={formData.especialidad}
            onChange={manejarCambio}
          >
            <option value="">Selecciona una especialidad</option>
            <option value="cardiologia">Cardiologia</option>
            <option value="neurologia">Neurologia</option>
            <option value="pediatria">Pediatria</option>
          </select>

          <label>Sede</label>
          <select name="sede" value={formData.sede} onChange={manejarCambio}>
            <option value="">Selecciona una sede</option>
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.id}>
                {sede.name}
              </option>
            ))}
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

          <p className="mensaje-error">{mensajeError}</p>

          <button className="admin-primary-button" type="submit" onClick={agendarCita}>
            Guardar Cita
          </button>
        </div>
      </form>
    </div>
  );
}

export default CitasAdmin;
