import { useCallback, useEffect, useRef, useState } from "react";
import { GoSearch } from "react-icons/go";
import "./App.css";

function AdminPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formEdicion, setFormEdicion] = useState({
    email: "",
    phone_number: "",
    active: true,
  });
  const [mensajeEdicion, setMensajeEdicion] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState({
    tdocumento: "",
    documento: "",
  });
  const detallePacienteRef = useRef(null);
  const edicionPacienteRef = useRef(null);

  const obtenerNombrePaciente = (paciente) => {
    const nombre = paciente.user?.nombre || paciente.nombre || "";
    const apellido = paciente.user?.apellido || paciente.apellido || "";
    return `${nombre} ${apellido}`.trim() || "Paciente sin nombre";
  };

  const obtenerEpsPaciente = (paciente) => (
    paciente.eps?.name || paciente.eps?.nombre || paciente.eps_name || "Sin EPS"
  );

  const obtenerEstadoPaciente = (paciente) => (
    paciente.estado || paciente.status || (paciente.user?.is_active === false ? "Inactivo" : "Activo")
  );

  const obtenerClaseEstado = (estado) => (
    estado.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  );

  const consultarPacientes = useCallback(async (termino = "@", tipoDocumento = "") => {
    setMensajeError("");
    setPacienteSeleccionado(null);
    setCargando(true);

    try {
      const response = await fetch(
        `http://localhost:8000/api/appointments/patients/search/?q=${encodeURIComponent(termino)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );
      const data = await response.json();

      if (!response.ok) {
        setMensajeError(data.detail || "No se pudieron buscar pacientes.");
        setPacientes([]);
        return;
      }

      const lista = Array.isArray(data) ? data : data.results || [];
      const pacientesFiltrados = tipoDocumento
        ? lista.filter((paciente) => paciente.document_type === tipoDocumento)
        : lista;

      if (pacientesFiltrados.length === 0) {
        setMensajeError("No se encontraron pacientes relacionados con la busqueda.");
      }

      setPacientes(pacientesFiltrados);
    } catch {
      setMensajeError("Error al buscar paciente. Por favor, intenta nuevamente.");
      setPacientes([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    consultarPacientes("@");
  }, [consultarPacientes]);

  const buscarPaciente = () => {
    const termino = busqueda.documento.trim() || "@";
    consultarPacientes(termino, busqueda.tdocumento);
  };

  const seleccionarPaciente = (paciente) => {
    setPacienteSeleccionado(paciente);
    setModoEdicion(false);
    setMensajeEdicion("");
    setFormEdicion({
      email: paciente.user?.email || "",
      phone_number: paciente.phone_number || paciente.user?.phone_number || "",
      active: obtenerEstadoPaciente(paciente).toLowerCase() !== "inactivo",
    });
    setMensajeError("");
    setTimeout(() => {
      detallePacienteRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const iniciarEdicion = () => {
    if (!pacienteSeleccionado) return;

    setModoEdicion(true);
    setMensajeEdicion("");
    setFormEdicion({
      email: pacienteSeleccionado.user?.email || "",
      phone_number: pacienteSeleccionado.phone_number || pacienteSeleccionado.user?.phone_number || "",
      active: obtenerEstadoPaciente(pacienteSeleccionado).toLowerCase() !== "inactivo",
    });
    setTimeout(() => {
      edicionPacienteRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const manejarCambioEdicion = (e) => {
    const { name, value, type, checked } = e.target;
    setFormEdicion((actual) => ({
      ...actual,
      [name]: type === "checkbox" ? checked : value,
    }));
    setMensajeEdicion("");
  };

  const guardarCambiosPaciente = (e) => {
    e.preventDefault();
    setMensajeEdicion(
      "No existe una API administrativa para modificar este paciente. El endpoint PATCH /api/patients/me/ solo permite que el paciente autenticado edite su propio correo y telefono; tampoco permite cambiar estado activo.",
    );
  };

  return (
    <div className="admin-form-page">
      <div className="admin-form-card">
        <h2>Gestion administrativa de pacientes</h2>
        <p>Consulta pacientes activos y revisa su informacion basica.</p>

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
        {cargando && <p>Cargando pacientes...</p>}

        <table className="reportes-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo Documento</th>
              <th>Documento</th>
              <th>Telefono</th>
              <th>Correo</th>
              <th>EPS</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {!cargando && pacientes.length === 0 && (
              <tr>
                <td colSpan="7">No hay pacientes para mostrar.</td>
              </tr>
            )}
            {pacientes.map((paciente) => {
              const estado = obtenerEstadoPaciente(paciente);

              return (
                <tr key={paciente.id} onClick={() => seleccionarPaciente(paciente)}>
                  <td>{obtenerNombrePaciente(paciente)}</td>
                  <td>{paciente.document_type || "Sin tipo"}</td>
                  <td>{paciente.identity_document || "Sin documento"}</td>
                  <td>{paciente.phone_number || paciente.user?.phone_number || "Sin telefono"}</td>
                  <td>{paciente.user?.email || "Sin correo"}</td>
                  <td>{obtenerEpsPaciente(paciente)}</td>
                  <td>
                    <span className={`badge status-${obtenerClaseEstado(estado)}`}>
                      {estado}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pacienteSeleccionado && (
        <div className="admin-form-card" ref={detallePacienteRef} style={{ marginTop: "22px" }}>
          <h2>Detalle del paciente</h2>
          

          <dl className="admin-detail-list">
            <dt>Nombre</dt>
            <dd>{obtenerNombrePaciente(pacienteSeleccionado)}</dd>
            <dt>Documento</dt>
            <dd>
              {pacienteSeleccionado.document_type} {pacienteSeleccionado.identity_document}
            </dd>
            <dt>Telefono</dt>
            <dd>{pacienteSeleccionado.phone_number || pacienteSeleccionado.user?.phone_number || "Sin telefono"}</dd>
            <dt>Correo</dt>
            <dd>{pacienteSeleccionado.user?.email || "Sin correo"}</dd>
            <dt>EPS</dt>
            <dd>{obtenerEpsPaciente(pacienteSeleccionado)}</dd>
            <dt>Estado</dt>
            <dd>{obtenerEstadoPaciente(pacienteSeleccionado)}</dd>
          </dl>

          {!modoEdicion && (
            <button type="button" className="admin-primary-button" onClick={iniciarEdicion}>
              Modificar
            </button>
          )}

          {modoEdicion && (
            <form className="admin-form-grid patient-edit-form" ref={edicionPacienteRef} onSubmit={guardarCambiosPaciente}>
              <label>Correo</label>
              <input
                type="email"
                name="email"
                value={formEdicion.email}
                onChange={manejarCambioEdicion}
              />

              <label>Telefono</label>
              <input
                name="phone_number"
                value={formEdicion.phone_number}
                onChange={manejarCambioEdicion}
              />

              <label>Estado</label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  name="active"
                  checked={formEdicion.active}
                  onChange={manejarCambioEdicion}
                  style={{ width: "auto" }}
                />
                <span>Paciente activo</span>
              </div>

              <button type="submit" className="admin-primary-button">
                Guardar cambios
              </button>
              <button type="button" className="cambiar_horario" onClick={() => setModoEdicion(false)}>
                Cancelar
              </button>

              {mensajeEdicion && <p className="mensaje-error">{mensajeEdicion}</p>}
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPacientes;
