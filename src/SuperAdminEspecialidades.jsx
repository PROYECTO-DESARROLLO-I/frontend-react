import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [busquedaEspecialidad, setBusquedaEspecialidad] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [toast, setToast] = useState({ visible: false, mensaje: "", tipo: "" });
  const [cargando, setCargando] = useState(false);

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
        fetch("http://localhost:8000/api/specialties/", { headers }),
        fetch("http://localhost:8000/api/eps/", { headers }),
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
    cargarDatos();
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

  const crearEspecialidad = (e) => {
    e.preventDefault();
    const mensaje =
      "Aun no existe endpoint para registrar especialidades. Cuando backend lo cree, este formulario queda listo para conectarse.";
    setMensajeExito("");
    setMensajeError(mensaje);
    mostrarToast(mensaje, "error");
  };

  const crearEPS = async (e) => {
    e.preventDefault();
    setMensajeError("");
    setMensajeExito("");

    try {
      const response = await fetch("http://localhost:8000/api/eps/", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: epsForm.name.trim(),
          code: epsForm.code.trim(),
          active: epsForm.active,
        }),
      });
      const data = await leerRespuesta(response);

      if (!response.ok) {
        const mensaje = obtenerMensajeError(data, "No se pudo crear la EPS.");
        setMensajeError(mensaje);
        mostrarToast(mensaje, "error");
        return;
      }

      setMensajeExito("EPS creada correctamente.");
      mostrarToast("EPS registrada correctamente.", "exito");
      setEpsForm(epsInicial);
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

      <div className="admin-form-card" style={{ marginTop: "22px" }}>
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
        <p>Este formulario sí consume el endpoint existente de superadmin: POST /api/eps/.</p>

        <form className="admin-form-grid" onSubmit={crearEPS}>
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
            Guardar EPS
          </button>
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
              <th>Descripcion</th>
              <th>Medicos disponibles</th>
            </tr>
          </thead>
          <tbody>
            {especialidadesFiltradas.length === 0 && (
              <tr>
                <td colSpan="3">No hay especialidades para mostrar.</td>
              </tr>
            )}
            {especialidadesFiltradas.map((especialidad) => (
              <tr key={especialidad.id}>
                <td>{especialidad.name}</td>
                <td>{especialidad.description || "Sin descripcion"}</td>
                <td>{especialidad.available_doctors_count ?? "No informado"}</td>
              </tr>
            ))}
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
            </tr>
          </thead>
          <tbody>
            {eps.length === 0 && (
              <tr>
                <td colSpan="3">No hay EPS para mostrar.</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SuperAdminEspecialidades;
