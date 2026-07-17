import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_URL } from "./apiConfig";
import "./App.css";

const especialidadInicial = {
  name: "",
  description: "",
};

const epsInicial = {
  name: "",
  code: "",
  active: true,
};

function SuperAdminEspecialidades() {
  const [especialidades, setEspecialidades] = useState([]);
  const [eps, setEps] = useState([]);
  const [especialidadForm, setEspecialidadForm] = useState(especialidadInicial);
  const [epsForm, setEpsForm] = useState(epsInicial);
  const [epsEditando, setEpsEditando] = useState(null);
  const [busquedaEspecialidad, setBusquedaEspecialidad] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [toast, setToast] = useState({ visible: false, mensaje: "", tipo: "" });
  const [cargando, setCargando] = useState(false);
  const epsFormRef = useRef(null);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    }),
    [],
  );

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

  const normalizarLista = (data) => (Array.isArray(data) ? data : data.results || []);

  const mostrarToast = (mensaje, tipo) => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => {
      setToast({ visible: false, mensaje: "", tipo: "" });
    }, 4000);
  };

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setMensajeError("");

    try {
      const [specialtiesResponse, epsResponse] = await Promise.all([
        fetch(`${API_URL}/api/dashboard/specialties/`, { headers }),
        fetch(`${API_URL}/api/eps/`, { headers }),
      ]);
      const [specialtiesData, epsData] = await Promise.all([
        leerRespuesta(specialtiesResponse),
        leerRespuesta(epsResponse),
      ]);

      if (!specialtiesResponse.ok) {
        setMensajeError(obtenerMensajeError(specialtiesData, "No se pudieron cargar las especialidades."));
      } else {
        setEspecialidades(normalizarLista(specialtiesData));
      }

      if (!epsResponse.ok) {
        setMensajeError(obtenerMensajeError(epsData, "No se pudieron cargar las EPS."));
      } else {
        setEps(normalizarLista(epsData));
      }
    } catch {
      setMensajeError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }, [headers]);

  useEffect(() => {
    cargarDatos().catch(console.error);
  }, [cargarDatos]);

  const manejarEspecialidad = (e) => {
    const { name, value } = e.target;
    setEspecialidadForm((actual) => ({ ...actual, [name]: value }));
    setMensajeError("");
    setMensajeExito("");
  };

  const manejarEPS = (e) => {
    const { name, value, type, checked } = e.target;
    setEpsForm((actual) => ({
      ...actual,
      [name]: type === "checkbox" ? checked : value,
    }));
    setMensajeError("");
    setMensajeExito("");
  };

  const crearEspecialidad = async (e) => {
    e.preventDefault();
    setMensajeError("");
    setMensajeExito("");

    try {
      const response = await fetch(`${API_URL}/api/dashboard/specialties/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: especialidadForm.name.trim(),
          description: especialidadForm.description.trim(),
        }),
      });

      const data = await leerRespuesta(response);

      if (!response.ok) {
        const mensaje = obtenerMensajeError(data, "No se pudo crear la especialidad.");
        setMensajeError(mensaje);
        mostrarToast(mensaje, "error");
        return;
      }

      mostrarToast("Especialidad creada correctamente.", "exito");
      setMensajeExito("Especialidad creada correctamente.");
      setEspecialidadForm(especialidadInicial);
      await cargarDatos();
    } catch {
      const mensaje = "Error de conexión con el servidor.";
      setMensajeError(mensaje);
      mostrarToast(mensaje, "error");
    }
  };

  const guardarEPS = async (e) => {
    e.preventDefault();
    setMensajeError("");
    setMensajeExito("");

    try {
      const url = epsEditando
        ? `${API_URL}/api/eps/${epsEditando.id}/`
        : `${API_URL}/api/eps/`;
      const response = await fetch(url, {
        method: epsEditando ? "PATCH" : "POST",
        headers,
        body: JSON.stringify({
          name: epsForm.name.trim(),
          code: epsForm.code.trim(),
          active: epsForm.active,
        }),
      });
      const data = await leerRespuesta(response);

      if (!response.ok) {
        const mensaje = obtenerMensajeError(data, "No se pudo guardar la EPS.");
        setMensajeError(mensaje);
        mostrarToast(mensaje, "error");
        return;
      }

      setMensajeExito(epsEditando ? "EPS actualizada correctamente." : "EPS creada correctamente.");
      mostrarToast(epsEditando ? "EPS actualizada correctamente." : "EPS registrada correctamente.", "exito");
      setEpsForm(epsInicial);
      setEpsEditando(null);
      await cargarDatos();
    } catch {
      const mensaje = "No se pudo conectar con el servidor.";
      setMensajeError(mensaje);
      mostrarToast(mensaje, "error");
    }
  };

  const editarEPS = (item) => {
    setEpsEditando(item);
    setEpsForm({
      name: item.name || "",
      code: item.code || "",
      active: Boolean(item.active),
    });
    setMensajeError("");
    setMensajeExito("");
    setTimeout(() => {
      epsFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const cancelarEdicionEPS = () => {
    setEpsEditando(null);
    setEpsForm(epsInicial);
    setMensajeError("");
    setMensajeExito("");
  };

  const eliminarEPS = async (item) => {
    const confirmar = window.confirm(`Eliminar la EPS ${item.name}?`);
    if (!confirmar) return;

    setMensajeError("");
    setMensajeExito("");

    try {
      const response = await fetch(`${API_URL}/api/eps/${item.id}/`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const data = await leerRespuesta(response);
        const mensaje = obtenerMensajeError(data, "No se pudo eliminar la EPS.");
        setMensajeError(mensaje);
        mostrarToast(mensaje, "error");
        return;
      }

      mostrarToast("EPS eliminada correctamente.", "exito");
      if (epsEditando?.id === item.id) cancelarEdicionEPS();
      await cargarDatos();
    } catch {
      const mensaje = "No se pudo conectar con el servidor.";
      setMensajeError(mensaje);
      mostrarToast(mensaje, "error");
    }
  };

  const especialidadesFiltradas = useMemo(() => {
    const texto = busquedaEspecialidad.trim().toLowerCase();
    if (!texto) return especialidades;

    return especialidades.filter((especialidad) => {
      const nombre = especialidad.name?.toLowerCase() || "";
      const descripcion = especialidad.description?.toLowerCase() || "";
      return nombre.includes(texto) || descripcion.includes(texto);
    });
  }, [busquedaEspecialidad, especialidades]);

  return (
    <div className="admin-form-page">
      <div
        className={`toast-animado ${toast.visible ? "entrar" : ""}`}
        style={{
          backgroundColor: toast.tipo === "exito" ? "#2e7d32" : "#DE300D",
        }}
      >
        {toast.mensaje}
      </div>

      <div className="admin-form-card">
        <h2>Especialidades y EPS</h2>
        <p>Gestiona la informacion base que usa el sistema para disponibilidad, reglas y agendamiento.</p>

        {mensajeError && <p className="mensaje-error">{mensajeError}</p>}
        {mensajeExito && <p className="mensaje-exito">{mensajeExito}</p>}
        {cargando && <p>Cargando informacion...</p>}
      </div>

      <div className="admin-form-card" ref={epsFormRef} style={{ marginTop: "22px" }}>
        <h2>Crear especialidad</h2>
      

        <form className="admin-form-grid" onSubmit={crearEspecialidad}>
          <label>Nombre</label>
          <input
            name="name"
            value={especialidadForm.name}
            onChange={manejarEspecialidad}
            placeholder="Ej. Dermatologia"
            required
          />

          <label>Descripcion</label>
          <textarea
            name="description"
            value={especialidadForm.description}
            onChange={manejarEspecialidad}
            placeholder="Descripcion de la especialidad"
            rows="4"
          />

          <button type="submit" className="admin-primary-button">
            Crear especialidad
          </button>
        </form>
      </div>

      <div className="admin-form-card" style={{ marginTop: "22px" }}>
        <h2>Añadir EPS</h2>
        

        <form className="admin-form-grid" onSubmit={guardarEPS}>
          <label>Nombre</label>
          <input name="name" value={epsForm.name} onChange={manejarEPS} placeholder="Ej. Sura" required />

          <label>Codigo</label>
          <input name="code" value={epsForm.code} onChange={manejarEPS} placeholder="Ej. EPS-SURA" required />

          <label>Estado</label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              name="active"
              checked={epsForm.active}
              onChange={manejarEPS}
              style={{ width: "auto" }}
            />
            <span>EPS activa</span>
          </div>

          <button type="submit" className="admin-primary-button">
            {epsEditando ? "Actualizar EPS" : "Guardar EPS"}
          </button>
          {epsEditando && (
            <button type="button" className="cambiar_horario" onClick={cancelarEdicionEPS}>
              Cancelar edicion
            </button>
          )}
        </form>
      </div>

      <div className="admin-form-card" style={{ marginTop: "22px" }}>
        <h2>Especialidades disponibles</h2>
        <div className="search-patient">
          <input
            value={busquedaEspecialidad}
            onChange={(e) => setBusquedaEspecialidad(e.target.value)}
            placeholder="Filtrar especialidad"
          />
          <button type="button" className="admin-primary-button" onClick={cargarDatos}>
            Actualizar
          </button>
        </div>

        <table className="reportes-tabla">
          <thead>
            <tr>
              <th>Especialidad</th>
              <th>Descripción</th>
              <th>Médicos disponibles</th>
            </tr>
          </thead>
          <tbody>
            {especialidadesFiltradas.length === 0 && (
              <tr>
                <td colSpan="3">No hay especialidades para mostrar.</td>
              </tr>
            )}
            {especialidadesFiltradas.map((especialidad) => {
              const {id, name, description, available_doctors_count = "No informado"} = especialidad;

              return (
                  <tr key={id}>
                    <td>{name}</td>
                    <td>{description || "Sin descripcion"}</td>
                    <td>{available_doctors_count ?? "No informado"}</td>
                  </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="admin-form-card" style={{ marginTop: "22px" }}>
        <h2>EPS registradas</h2>
        <table className="reportes-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Codigo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {eps.length === 0 && (
              <tr>
                <td colSpan="4">No hay EPS para mostrar.</td>
              </tr>
            )}
            {eps.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.code}</td>
                <td>
                  <span className={`badge ${item.active ? "status-activo" : "status-inactivo"}`}>
                    {item.active ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td>
                  <div className="acciones-tabla">
                    <button type="button" className="cambiar_horario" onClick={() => editarEPS(item)}>
                      Editar
                    </button>
                    <button type="button" className="admin-primary-button" onClick={() => eliminarEPS(item)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SuperAdminEspecialidades;
