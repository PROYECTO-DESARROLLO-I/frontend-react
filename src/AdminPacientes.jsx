import { useState } from "react";
import "./App.css";

function AdminPacientes() {
  const [busqueda, setBusqueda] = useState("");
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);

  const obtenerNombrePaciente = (paciente) => {
    const nombre = paciente.user?.nombre || "";
    const apellido = paciente.user?.apellido || "";
    return `${nombre} ${apellido}`.trim() || "Paciente sin nombre";
  };

  const buscarPacientes = async (e) => {
    e.preventDefault();
    setMensajeError("");
    setPacienteSeleccionado(null);

    if (!busqueda.trim()) {
      setPacientes([]);
      setMensajeError("Escribe un nombre, correo o documento para buscar pacientes.");
      return;
    }

    setCargando(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:8000/api/appointments/patients/search/?q=${encodeURIComponent(busqueda.trim())}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      if (!response.ok) {
        setMensajeError(data.detail || "No se pudieron consultar los pacientes.");
        setPacientes([]);
        return;
      }

      setPacientes(Array.isArray(data) ? data : data.results || []);
    } catch {
      setMensajeError("No se pudo conectar con el servidor.");
      setPacientes([]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="admin-form-page">
      <div className="admin-form-card">
        <h2>Gestion administrativa de pacientes</h2>
        <p>Consulta pacientes activos por nombre, correo o documento para revisar sus datos basicos.</p>

        <form className="search-patient" onSubmit={buscarPacientes}>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, correo o documento"
          />
          <button type="submit" className="admin-primary-button">
            Buscar
          </button>
        </form>

        {mensajeError && <p className="mensaje-error">{mensajeError}</p>}
        {cargando && <p>Cargando pacientes...</p>}

        <table className="reportes-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Telefono</th>
              <th>Correo</th>
              <th>EPS</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            {!cargando && pacientes.length === 0 && (
              <tr>
                <td colSpan="6">No hay pacientes para mostrar.</td>
              </tr>
            )}
            {pacientes.map((paciente) => (
              <tr key={paciente.id}>
                <td>{obtenerNombrePaciente(paciente)}</td>
                <td>
                  {paciente.document_type} {paciente.identity_document}
                </td>
                <td>{paciente.phone_number || "Sin telefono"}</td>
                <td>{paciente.user?.email || "Sin correo"}</td>
                <td>{paciente.eps?.name || "Sin EPS"}</td>
                <td>
                  <button type="button" className="cambiar_horario" onClick={() => setPacienteSeleccionado(paciente)}>
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pacienteSeleccionado && (
        <div className="admin-form-card" style={{ marginTop: "22px" }}>
          <h2>Detalle del paciente</h2>
          <p>Informacion disponible desde la API actual de busqueda de pacientes.</p>

          <dl className="admin-detail-list">
            <dt>Nombre</dt>
            <dd>{obtenerNombrePaciente(pacienteSeleccionado)}</dd>
            <dt>Documento</dt>
            <dd>
              {pacienteSeleccionado.document_type} {pacienteSeleccionado.identity_document}
            </dd>
            <dt>Telefono</dt>
            <dd>{pacienteSeleccionado.phone_number || "Sin telefono"}</dd>
            <dt>Correo</dt>
            <dd>{pacienteSeleccionado.user?.email || "Sin correo"}</dd>
            <dt>EPS</dt>
            <dd>{pacienteSeleccionado.eps?.name || "Sin EPS"}</dd>
          </dl>

          <p className="mensaje-error">
            Pendiente backend: no existe endpoint administrativo para crear, editar o desactivar pacientes.
          </p>
        </div>
      )}
    </div>
  );
}

export default AdminPacientes;
