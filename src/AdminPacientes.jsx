import { useCallback, useEffect, useRef, useState } from "react";
import { GoSearch } from "react-icons/go";
import { API_URL } from "./apiConfig";
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
  const [mensajeEdicion, setMensajeEdicion] = useState({ texto: "", tipo: "" });
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState({
    tdocumento: "",
    documento: "",
  });
  const detallePacienteRef = useRef(null);
  // noinspection DuplicatedCode
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
        `${API_URL}/api/appointments/patients/search/?q=${encodeURIComponent(termino)}`,
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

  useEffect(()=> {
    consultarPacientes("@").catch(console.error);
  }, [consultarPacientes]);

  const buscarPaciente = async () => {
    const termino = busqueda.documento.trim() || "@";
    await consultarPacientes(termino, busqueda.tdocumento);
  };

  const seleccionarPaciente = (paciente) => {
    setPacienteSeleccionado(paciente);
    setModoEdicion(false);
    setMensajeEdicion({ texto: "", tipo: "" });
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
    setMensajeEdicion({ texto: "", tipo: "" });
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
    setMensajeEdicion({ texto: "", tipo: "" });
  };

  const guardarCambiosPaciente = async (e) => {
    e.preventDefault();
    setCargando(true);

    // Determinamos la acción según el valor del formulario
    const accion = formEdicion.active ? "activate" : "deactivate";
    const url = `${API_URL}/api/patients/${pacienteSeleccionado.id}/${accion}/`;

    try {
      const response = await fetch(url, {
        method: 'POST', // La API usa POST, no PATCH
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
        },
        // El cuerpo no es necesario porque el endpoint ya sabe qué hacer por su URL
      });

      if (response.ok) {
        setMensajeEdicion({
          texto: `Paciente ${formEdicion.active ? 'activado' : 'desactivado'} con éxito.`,
          tipo: "exito"
        });
        setModoEdicion(false);
        await consultarPacientes("@"); // Recarga la lista
      } else {
        const data = await response.json();
        setMensajeEdicion({
          texto: data.detail || "Error al actualizar el paciente.",
          tipo: "error"
        });
      }
    } catch (error) {
      setMensajeEdicion({ texto: "Error de conexión con el servidor.", tipo: "error" });
    } finally {
      setCargando(false);
    }
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
                disabled={cargando}
              />

              <label>Telefono</label>
              <input
                name="phone_number"
                value={formEdicion.phone_number}
                onChange={manejarCambioEdicion}
                disabled={cargando}
              />

              <label>Estado</label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  name="active"
                  checked={formEdicion.active}
                  onChange={manejarCambioEdicion}
                  disabled={cargando}
                  style={{ width: "auto" }}
                />
                <span>Paciente activo</span>
              </div>

              <button type="submit" className="admin-primary-button" disabled={cargando}>
                {cargando ? "Guardando..." : "Guardar cambios"}
              </button>
              <button type="button" className="cambiar_horario" onClick={() => setModoEdicion(false)} disabled={cargando}>
                Cancelar
              </button>

              {mensajeEdicion.texto && (<p className={mensajeEdicion.tipo === "exito" ? "mensaje-exito" : "mensaje-error-box"}>
                {mensajeEdicion.texto}
              </p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPacientes;
