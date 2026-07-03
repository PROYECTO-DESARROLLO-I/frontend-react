import { useState } from "react";
import "./App.css";
import { GoArrowLeft, GoSearch } from "react-icons/go";
import AgendamientoCitas from "./agendamientoCitas.jsx";

function CitasAdmin({ volverAlDashboard }) {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [mensajeError, setMensajeError] = useState("");
  const [busqueda, setBusqueda] = useState({
    tdocumento: "",
    documento: "",
  });

  const obtenerNombrePaciente = (paciente) => {
    const nombre = paciente.user?.nombre || paciente.nombre || "";
    const apellido = paciente.user?.apellido || paciente.apellido || "";
    return `${nombre} ${apellido}`.trim() || "Paciente sin nombre";
  };

  const obtenerEpsPaciente = (paciente) => (
    paciente.eps?.name || paciente.eps_name || "Sin EPS"
  );

  const buscarPaciente = async () => {
    setMensajeError("");
    setPacienteSeleccionado(null);
    setPacientes([]);

  

    try {
      const response = await fetch(
        `http://localhost:8000/api/appointments/patients/search/?q=${encodeURIComponent(busqueda.documento.trim())}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMensajeError(data.detail || "No se pudieron buscar pacientes.");
        return;
      }

      const pacientesFiltrados = busqueda.tdocumento
        ? data.filter((paciente) => paciente.document_type === busqueda.tdocumento)
        : data;

      if (pacientesFiltrados.length === 0) {
        setMensajeError("No se encontraron pacientes relacionados con la busqueda.");
      }

      setPacientes(pacientesFiltrados);
    } catch {
      setMensajeError("Error al buscar paciente. Por favor, intenta nuevamente.");
    }
  };

  const seleccionarPaciente = (paciente) => {
    setPacienteSeleccionado(paciente);
    setMensajeError("");
  };

  return (
    <div className="admin-form-page">
      <div className="admin-back" onClick={volverAlDashboard}>
        <GoArrowLeft />
        <p>Volver al Panel</p>
      </div>

      <div className="admin-form-card">
        <h2>Agendar Cita</h2>
        <p>Busca un paciente y selecciona el registro para agendarle una cita.</p>

        <div className="search-patient">
          <label>Buscar Paciente</label>
          <select
            name="tdocumento"
            value={busqueda.tdocumento}
            onChange={(e) => setBusqueda({ ...busqueda, tdocumento: e.target.value })}
          >
            <option value="">Tipo de documento</option>
            <option value="CC">Cedula de Ciudadania</option>
            <option value="CE">Cedula de Extranjeria</option>
            <option value="TI">Tarjeta de Identidad</option>
            <option value="PAS">Pasaporte</option>
          </select>

          <input
            name="documento"
            type="text"
            value={busqueda.documento}
            onChange={(e) => setBusqueda({ ...busqueda, documento: e.target.value })}
            placeholder="Numero de documento"
          />

          <button className="admin-back" type="button" onClick={buscarPaciente}>
            <GoSearch />
          </button>
        </div>

        {mensajeError && <p className="mensaje-error">{mensajeError}</p>}

        {pacientes.length > 0 && !pacienteSeleccionado && (
          <table className="tabla-pacientes">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Telefono</th>
                <th>EPS</th>
              </tr>
            </thead>

            <tbody>
              {pacientes.map((paciente) => (
                <tr key={paciente.id}>
                  <td>
                    <button type="button" onClick={() => seleccionarPaciente(paciente)}>
                      {obtenerNombrePaciente(paciente)}
                    </button>
                  </td>
                  <td>{paciente.identity_document}</td>
                  <td>{paciente.phone_number || "Sin telefono"}</td>
                  <td>{obtenerEpsPaciente(paciente)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {pacienteSeleccionado && (
          <AgendamientoCitas
            patientId={pacienteSeleccionado.id}
            volverAlDashboard={() => setPacienteSeleccionado(null)}
          />
        )}
      </div>
    </div>
  );
}

export default CitasAdmin;
