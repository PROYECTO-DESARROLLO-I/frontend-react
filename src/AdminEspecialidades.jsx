import { useCallback, useEffect, useState } from "react";
import "./App.css";

const especialidadInicial = {
  name: "",
  description: "",
  active: true,
};

function AdminEspecialidades() {
  const [especialidades, setEspecialidades] = useState([]);
  const [formulario, setFormulario] = useState(especialidadInicial);
  const [especialidadEditando, setEspecialidadEditando] = useState(null);
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

  const cargarEspecialidades = useCallback(async () => {
    setCargando(true);
    setMensajeError("");

    try {
      const params = new URLSearchParams();
      if (busqueda.trim()) params.set("q", busqueda.trim());
      if (estadoFiltro) params.set("active", estadoFiltro);

      const response = await fetch(`http://localhost:8000/api/specialties/admin/?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token()}`,
        },
      });
      const data = await leerRespuesta(response);

      if (!response.ok) {
        setMensajeError(obtenerMensajeError(data, "No se pudieron cargar las especialidades."));
        return;
      }

      setEspecialidades(Array.isArray(data) ? data : []);
    } catch {
      setMensajeError("Error de conexion al cargar especialidades.");
    } finally {
      setCargando(false);
    }
  }, [busqueda, estadoFiltro]);

  useEffect(() => {
    cargarEspecialidades();
  }, [cargarEspecialidades]);

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
    setFormulario(especialidadInicial);
    setEspecialidadEditando(null);
  };

  const editarEspecialidad = (especialidad) => {
    setEspecialidadEditando(especialidad);
    setFormulario({
      name: especialidad.name || "",
      description: especialidad.description || "",
      active: especialidad.active !== false,
    });
  };

  const guardarEspecialidad = async (e) => {
    e.preventDefault();
    setMensajeError("");
    setMensajeExito("");

    const creando = !especialidadEditando;
    const url = creando
      ? "http://localhost:8000/api/specialties/admin/"
      : `http://localhost:8000/api/specialties/admin/${especialidadEditando.id}/`;

    try {
      const response = await fetch(url, {
        method: creando ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          name: formulario.name.trim(),
          description: formulario.description.trim(),
          active: formulario.active,
        }),
      });
      const data = await leerRespuesta(response);

      if (!response.ok) {
        setMensajeError(obtenerMensajeError(data, "No se pudo guardar la especialidad."));
        return;
      }

      setMensajeExito(creando ? "Especialidad creada correctamente." : "Especialidad actualizada correctamente.");
      limpiarFormulario();
      await cargarEspecialidades();
    } catch {
      setMensajeError("Error de conexion al guardar especialidad.");
    }
  };

  const desactivarEspecialidad = async (especialidad) => {
    setMensajeError("");
    setMensajeExito("");

    try {
      const response = await fetch(`http://localhost:8000/api/specialties/admin/${especialidad.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token()}`,
        },
      });
      const data = await leerRespuesta(response);

      if (!response.ok) {
        setMensajeError(obtenerMensajeError(data, "No se pudo desactivar la especialidad."));
        return;
      }

      setMensajeExito("Especialidad desactivada correctamente.");
      await cargarEspecialidades();
    } catch {
      setMensajeError("Error de conexion al desactivar especialidad.");
    }
  };

  return (
    <div className="admin-form-page">
      <div className="admin-form-card">
        <h2>Gestion de especialidades</h2>
        <p>Administra las especialidades que se usan en agenda, disponibilidad y registro de medicos.</p>

        {mensajeError && <p className="mensaje-error">{mensajeError}</p>}
        {mensajeExito && <p className="mensaje-exito">{mensajeExito}</p>}

        <form className="admin-form-grid" onSubmit={guardarEspecialidad}>
          <label>Nombre</label>
          <input name="name" value={formulario.name} onChange={manejarCambio} required />

          <label>Descripcion</label>
          <textarea name="description" value={formulario.description} onChange={manejarCambio} rows="4" />

          <label>Estado</label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              name="active"
              checked={formulario.active}
              onChange={manejarCambio}
              style={{ width: "auto" }}
            />
            <span>Especialidad activa</span>
          </div>

          <button type="submit" className="admin-primary-button">
            {especialidadEditando ? "Guardar cambios" : "Crear especialidad"}
          </button>
          {especialidadEditando && (
            <button type="button" className="cambiar_horario" onClick={limpiarFormulario}>
              Cancelar edicion
            </button>
          )}
        </form>
      </div>

      <div className="admin-form-card" style={{ marginTop: "22px" }}>
        <h2>Especialidades registradas</h2>
        <p>Consulta por nombre o descripcion y filtra por estado.</p>

        <div className="search-patient">
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar especialidad" />
          <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
            <option value="">Todas</option>
            <option value="true">Activas</option>
            <option value="false">Inactivas</option>
          </select>
          <button type="button" className="admin-back" onClick={cargarEspecialidades}>
            Buscar
          </button>
        </div>

        {cargando && <p>Cargando especialidades...</p>}

        <table className="reportes-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripcion</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {especialidades.map((especialidad) => (
              <tr key={especialidad.id}>
                <td>{especialidad.name}</td>
                <td>{especialidad.description || "Sin descripcion"}</td>
                <td>
                  <span className={`badge ${especialidad.active ? "status-activo" : "status-inactivo"}`}>
                    {especialidad.active ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td>
                  <button type="button" className="cambiar_horario" onClick={() => editarEspecialidad(especialidad)}>
                    Editar
                  </button>
                  {especialidad.active && (
                    <button
                      type="button"
                      className="cancel-appointment-button"
                      onClick={() => desactivarEspecialidad(especialidad)}
                    >
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

export default AdminEspecialidades;
