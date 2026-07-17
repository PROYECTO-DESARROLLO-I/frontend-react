import { useCallback, useEffect, useMemo, useState } from "react";
import { API_URL } from "./apiConfig";
import "./App.css";

function AdminEspecialidades() {
  const [especialidades, setEspecialidades] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);

  const cargarEspecialidades = useCallback(async () => {
    setCargando(true);
    setMensajeError("");

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_URL}/api/specialties/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        setMensajeError(data.detail || "No se pudieron cargar las especialidades.");
        setEspecialidades([]);
        return;
      }

      setEspecialidades(Array.isArray(data) ? data : data.results || []);
    } catch {
      setMensajeError("No se pudo conectar con el servidor.");
      setEspecialidades([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarEspecialidades();
  }, [cargarEspecialidades]);

  const especialidadesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return especialidades;

    return especialidades.filter((especialidad) => {
      const nombre = especialidad.name?.toLowerCase() || "";
      const descripcion = especialidad.description?.toLowerCase() || "";
      return nombre.includes(texto) || descripcion.includes(texto);
    });
  }, [busqueda, especialidades]);

  return (
    <div className="admin-form-page">
      <div className="admin-form-card">
        <h2>Gestion de especialidades</h2>
        <p>Consulta las especialidades activas que el backend expone para agendamiento.</p>

        <div className="search-patient">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Filtrar por nombre o descripcion"
          />
          <button type="button" className="admin-primary-button" onClick={cargarEspecialidades}>
            Actualizar
          </button>
        </div>

        {mensajeError && <p className="mensaje-error">{mensajeError}</p>}
        {cargando && <p>Cargando especialidades...</p>}

        <table className="reportes-tabla">
          <thead>
            <tr>
              <th>Especialidad</th>
              <th>Descripcion</th>
              <th>Medicos disponibles</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {!cargando && especialidadesFiltradas.length === 0 && (
              <tr>
                <td colSpan="4">No hay especialidades para mostrar.</td>
              </tr>
            )}
            {especialidadesFiltradas.map((especialidad) => (
              <tr key={especialidad.id}>
                <td>{especialidad.name}</td>
                <td>{especialidad.description || "Sin descripcion"}</td>
                <td>{especialidad.available_doctors_count ?? "No informado"}</td>
                <td>
                  <span className="badge status-activo">Activa</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mensaje-error">
          Pendiente backend: no existe endpoint para crear, editar o desactivar especialidades desde el front.
        </p>
      </div>
    </div>
  );
}

export default AdminEspecialidades;
