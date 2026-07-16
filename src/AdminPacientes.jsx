import { useCallback, useEffect, useState } from "react";
import "./App.css";

const estadoInicial = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  document_type: "CC",
  identity_document: "",
  date_birth: "",
  phone_number: "",
  address: "",
  eps: "",
  sede: "",
  active: true,
};

function AdminPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [eps, setEps] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [formulario, setFormulario] = useState(estadoInicial);
  const [pacienteEditando, setPacienteEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [cargando, setCargando] = useState(false);

  const token = () => localStorage.getItem("accessToken");

  const leerRespuesta = async (response) => {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { detail: text };
    }
  };

  const obtenerMensajeError = (data, respaldo) => {
    if (data?.detail) return data.detail;
    const primerError = Object.values(data || {})[0];
    if (Array.isArray(primerError)) return primerError[0];
    if (typeof primerError === "string") return primerError;
    return respaldo;
  };

  const cargarPacientes = useCallback(async () => {
    setCargando(true);
    setMensajeError("");

    try {
      const params = new URLSearchParams();
      if (busqueda.trim()) params.set("q", busqueda.trim());
      if (estadoFiltro) params.set("active", estadoFiltro);

      const response = await fetch(`http://localhost:8000/api/patients/admin/?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token()}`,
        },
      });
      const data = await leerRespuesta(response);

      if (!response.ok) {
        setMensajeError(obtenerMensajeError(data, "No se pudieron cargar los pacientes."));
        return;
      }

      setPacientes(Array.isArray(data) ? data : []);
    } catch {
      setMensajeError("Error de conexion al cargar pacientes.");
    } finally {
      setCargando(false);
    }
  }, [busqueda, estadoFiltro]);

  const cargarCatalogos = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token()}` };
      const [epsResponse, sedesResponse] = await Promise.all([
        fetch("http://localhost:8000/api/eps/", { headers }),
        fetch("http://localhost:8000/api/headquarters/", { headers }),
      ]);
      const [epsData, sedesData] = await Promise.all([
        leerRespuesta(epsResponse),
        leerRespuesta(sedesResponse),
      ]);

      if (epsResponse.ok) setEps(Array.isArray(epsData) ? epsData : []);
      if (sedesResponse.ok) setSedes(Array.isArray(sedesData) ? sedesData : []);
    } catch {
      setMensajeError("No se pudieron cargar EPS o sedes.");
    }
  }, []);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  useEffect(() => {
    cargarPacientes();
  }, [cargarPacientes]);

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario((actual) => ({
      ...actual,
      [name]: type === "checkbox" ? checked : value,
    }));
    setMensajeError("");
    setMensajeExito("");
  };

  const limpiarFormulario = () => {
    setFormulario(estadoInicial);
    setPacienteEditando(null);
  };

  const editarPaciente = (paciente) => {
    setPacienteEditando(paciente);
    setFormulario({
      nombre: paciente.nombre || "",
      apellido: paciente.apellido || "",
      email: paciente.email || "",
      password: "",
      document_type: paciente.document_type || "CC",
      identity_document: paciente.identity_document || "",
      date_birth: paciente.date_birth || "",
      phone_number: paciente.phone_number || "",
      address: paciente.address || "",
      eps: paciente.eps || "",
      sede: paciente.sede || "",
      active: paciente.active !== false,
    });
  };

  const guardarPaciente = async (e) => {
    e.preventDefault();
    setMensajeError("");
    setMensajeExito("");

    const creando = !pacienteEditando;
    const body = creando
      ? {
          user: {
            nombre: formulario.nombre.trim(),
            apellido: formulario.apellido.trim(),
            email: formulario.email.trim(),
            password: formulario.password,
          },
          document_type: formulario.document_type,
          identity_document: formulario.identity_document.trim(),
          date_birth: formulario.date_birth,
          phone_number: formulario.phone_number.trim(),
          address: formulario.address.trim(),
          eps: Number(formulario.eps),
        }
      : {
          nombre: formulario.nombre.trim(),
          apellido: formulario.apellido.trim(),
          email: formulario.email.trim(),
          document_type: formulario.document_type,
          identity_document: formulario.identity_document.trim(),
          date_birth: formulario.date_birth,
          phone_number: formulario.phone_number.trim(),
          address: formulario.address.trim(),
          eps: formulario.eps ? Number(formulario.eps) : null,
          sede: formulario.sede ? Number(formulario.sede) : null,
          active: formulario.active,
        };

    if (creando && !formulario.password) {
      setMensajeError("La contrasena es obligatoria para crear un paciente.");
      return;
    }

    try {
      const response = await fetch(
        creando
          ? "http://localhost:8000/api/patients/admin/"
          : `http://localhost:8000/api/patients/admin/${pacienteEditando.id}/`,
        {
          method: creando ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify(body),
        },
      );
      const data = await leerRespuesta(response);

      if (!response.ok) {
        setMensajeError(obtenerMensajeError(data, "No se pudo guardar el paciente."));
        return;
      }

      setMensajeExito(creando ? "Paciente creado correctamente." : "Paciente actualizado correctamente.");
      limpiarFormulario();
      await cargarPacientes();
    } catch {
      setMensajeError("Error de conexion al guardar paciente.");
    }
  };

  const desactivarPaciente = async (paciente) => {
    setMensajeError("");
    setMensajeExito("");

    try {
      const response = await fetch(`http://localhost:8000/api/patients/admin/${paciente.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token()}`,
        },
      });
      const data = await leerRespuesta(response);

      if (!response.ok) {
        setMensajeError(obtenerMensajeError(data, "No se pudo desactivar el paciente."));
        return;
      }

      setMensajeExito("Paciente desactivado correctamente.");
      await cargarPacientes();
    } catch {
      setMensajeError("Error de conexion al desactivar paciente.");
    }
  };

  return (
    <div className="admin-form-page">
      <div className="admin-form-card">
        <h2>Gestion de pacientes</h2>
        <p>Consulta, registra, edita y desactiva pacientes de SaludAgendaX.</p>

        {mensajeError && <p className="mensaje-error">{mensajeError}</p>}
        {mensajeExito && <p className="mensaje-exito">{mensajeExito}</p>}

        <form className="admin-form-grid" onSubmit={guardarPaciente}>
          <label>Nombres</label>
          <input name="nombre" value={formulario.nombre} onChange={manejarCambio} required />

          <label>Apellidos</label>
          <input name="apellido" value={formulario.apellido} onChange={manejarCambio} required />

          <label>Correo</label>
          <input type="email" name="email" value={formulario.email} onChange={manejarCambio} required />

          {!pacienteEditando && (
            <>
              <label>Contrasena</label>
              <input type="password" name="password" value={formulario.password} onChange={manejarCambio} required />
            </>
          )}

          <label>Tipo de documento</label>
          <select name="document_type" value={formulario.document_type} onChange={manejarCambio}>
            <option value="CC">Cedula de ciudadania</option>
            <option value="TI">Tarjeta de identidad</option>
            <option value="CE">Cedula de extranjeria</option>
            <option value="PAS">Pasaporte</option>
          </select>

          <label>Documento</label>
          <input name="identity_document" value={formulario.identity_document} onChange={manejarCambio} required />

          <label>Fecha de nacimiento</label>
          <input type="date" name="date_birth" value={formulario.date_birth} onChange={manejarCambio} required />

          <label>Telefono</label>
          <input name="phone_number" value={formulario.phone_number} onChange={manejarCambio} required />

          <label>Direccion</label>
          <input name="address" value={formulario.address} onChange={manejarCambio} required />

          <label>EPS</label>
          <select name="eps" value={formulario.eps} onChange={manejarCambio} required>
            <option value="">-- Seleccione EPS --</option>
            {eps.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          {pacienteEditando && (
            <>
              <label>Sede</label>
              <select name="sede" value={formulario.sede || ""} onChange={manejarCambio}>
                <option value="">-- Sin sede --</option>
                {sedes.map((sede) => (
                  <option key={sede.id} value={sede.id}>
                    {sede.name}
                  </option>
                ))}
              </select>

              <label>Estado</label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input type="checkbox" name="active" checked={formulario.active} onChange={manejarCambio} style={{ width: "auto" }} />
                <span>Paciente activo</span>
              </div>
            </>
          )}

          <button type="submit" className="admin-primary-button">
            {pacienteEditando ? "Guardar cambios" : "Crear paciente"}
          </button>
          {pacienteEditando && (
            <button type="button" className="cambiar_horario" onClick={limpiarFormulario}>
              Cancelar edicion
            </button>
          )}
        </form>
      </div>

      <div className="admin-form-card" style={{ marginTop: "22px" }}>
        <h2>Pacientes registrados</h2>
        <p>Filtra por nombre, correo, documento o telefono.</p>

        <div className="search-patient">
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar paciente" />
          <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
          <button type="button" className="admin-back" onClick={cargarPacientes}>
            Buscar
          </button>
        </div>

        {cargando && <p>Cargando pacientes...</p>}

        <table className="reportes-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Telefono</th>
              <th>EPS</th>
              <th>Sede</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((paciente) => (
              <tr key={paciente.id}>
                <td>{paciente.nombre} {paciente.apellido}</td>
                <td>{paciente.document_type} {paciente.identity_document}</td>
                <td>{paciente.phone_number}</td>
                <td>{paciente.eps_name || "Sin EPS"}</td>
                <td>{paciente.sede_name || "Sin sede"}</td>
                <td>
                  <span className={`badge ${paciente.active ? "status-activo" : "status-inactivo"}`}>
                    {paciente.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td>
                  <button type="button" className="cambiar_horario" onClick={() => editarPaciente(paciente)}>
                    Editar
                  </button>
                  {paciente.active && (
                    <button type="button" className="cancel-appointment-button" onClick={() => desactivarPaciente(paciente)}>
                      Desactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPacientes;
