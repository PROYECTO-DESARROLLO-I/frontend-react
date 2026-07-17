import { useCallback, useEffect, useMemo, useState } from "react";
import { API_URL } from "./apiConfig";
import "./App.css";

const disponibilidadInicial = {
  doctor: "",
  specialty: "",
  headquarters: "",
  weekday: "0",
  start_time: "08:00",
  end_time: "12:00",
  appointment_duration: "30",
  consulting_room: "",
  active: true,
};

const excepcionInicial = {
  doctor: "",
  date: "",
  reason: "",
  type: "bloqueo",
};

const diasSemana = [
  { value: "0", label: "Lunes" },
  { value: "1", label: "Martes" },
  { value: "2", label: "Miercoles" },
  { value: "3", label: "Jueves" },
  { value: "4", label: "Viernes" },
  { value: "5", label: "Sabado" },
  { value: "6", label: "Domingo" },
];

function SuperAdminDisponibilidad() {
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [excepciones, setExcepciones] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [disponibilidadForm, setDisponibilidadForm] = useState(disponibilidadInicial);
  const [excepcionForm, setExcepcionForm] = useState(excepcionInicial);
  const [filtroDoctor, setFiltroDoctor] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
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

  const normalizarLista = (data) => (Array.isArray(data) ? data : data.results || []);

  const obtenerMensajeError = (data, respaldo) => {
    if (data?.detail) return data.detail;
    const primerError = Object.values(data || {})[0];
    if (Array.isArray(primerError)) return primerError[0];
    if (typeof primerError === "string") return primerError;
    return respaldo;
  };

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setMensajeError("");

    const doctorQuery = filtroDoctor.trim() ? `?doctor=${encodeURIComponent(filtroDoctor.trim())}` : "";

    try {
      const [availabilityResponse, exceptionsResponse, specialtiesResponse, headquartersResponse] = await Promise.all([
        fetch(`${API_URL}/api/availability/manage/${doctorQuery}`, { headers }),
        fetch(`${API_URL}/api/availability/exceptions/${doctorQuery}`, { headers }),
        fetch(`${API_URL}/api/specialties/`, { headers }),
        fetch(`${API_URL}/api/headquarters/`, { headers }),
      ]);

      const [availabilityData, exceptionsData, specialtiesData, headquartersData] = await Promise.all([
        leerRespuesta(availabilityResponse),
        leerRespuesta(exceptionsResponse),
        leerRespuesta(specialtiesResponse),
        leerRespuesta(headquartersResponse),
      ]);

      if (!availabilityResponse.ok) {
        setMensajeError(obtenerMensajeError(availabilityData, "No se pudo cargar la disponibilidad."));
      } else {
        setDisponibilidades(normalizarLista(availabilityData));
      }

      if (!exceptionsResponse.ok) {
        setMensajeError(obtenerMensajeError(exceptionsData, "No se pudieron cargar las excepciones."));
      } else {
        setExcepciones(normalizarLista(exceptionsData));
      }

      if (specialtiesResponse.ok) setEspecialidades(normalizarLista(specialtiesData));
      if (headquartersResponse.ok) setSedes(normalizarLista(headquartersData));
    } catch {
      setMensajeError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }, [filtroDoctor, headers]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const manejarDisponibilidad = (e) => {
    const { name, value, type, checked } = e.target;
    setDisponibilidadForm((actual) => ({
      ...actual,
      [name]: type === "checkbox" ? checked : value,
    }));
    setMensajeError("");
    setMensajeExito("");
  };

  const manejarExcepcion = (e) => {
    const { name, value } = e.target;
    setExcepcionForm((actual) => ({ ...actual, [name]: value }));
    setMensajeError("");
    setMensajeExito("");
  };

  const crearDisponibilidad = async (e) => {
    e.preventDefault();
    setMensajeError("");
    setMensajeExito("");

    try {
      const response = await fetch(`${API_URL}/api/availability/manage/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          doctor: Number(disponibilidadForm.doctor),
          specialty: Number(disponibilidadForm.specialty),
          headquarters: disponibilidadForm.headquarters ? Number(disponibilidadForm.headquarters) : null,
          weekday: Number(disponibilidadForm.weekday),
          start_time: disponibilidadForm.start_time,
          end_time: disponibilidadForm.end_time,
          appointment_duration: Number(disponibilidadForm.appointment_duration),
          consulting_room: disponibilidadForm.consulting_room.trim(),
          active: disponibilidadForm.active,
        }),
      });
      const data = await leerRespuesta(response);

      if (!response.ok) {
        setMensajeError(obtenerMensajeError(data, "No se pudo crear la disponibilidad."));
        return;
      }

      setMensajeExito("Disponibilidad creada correctamente.");
      setDisponibilidadForm(disponibilidadInicial);
      await cargarDatos();
    } catch {
      setMensajeError("No se pudo conectar con el servidor.");
    }
  };

  const crearExcepcion = async (e) => {
    e.preventDefault();
    setMensajeError("");
    setMensajeExito("");

    try {
      const response = await fetch(`${API_URL}/api/availability/exceptions/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          doctor: Number(excepcionForm.doctor),
          date: excepcionForm.date,
          reason: excepcionForm.reason.trim(),
          type: excepcionForm.type,
        }),
      });
      const data = await leerRespuesta(response);

      if (!response.ok) {
        setMensajeError(obtenerMensajeError(data, "No se pudo crear la excepcion."));
        return;
      }

      setMensajeExito("Excepcion creada correctamente.");
      setExcepcionForm(excepcionInicial);
      await cargarDatos();
    } catch {
      setMensajeError("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="admin-form-page">
      <div className="admin-form-card">
        <h2>Disponibilidad médica</h2>
        <p>Gestiona jornadas y excepciones usando componentes administrativos de disponibilidad.</p>

        <div className="search-patient">
          <input
            type="number"
            value={filtroDoctor}
            onChange={(e) => setFiltroDoctor(e.target.value)}
            placeholder="Filtrar por ID de médico"
          />
          <button type="button" className="admin-primary-button" onClick={cargarDatos}>
            Buscar
          </button>
        </div>

        {mensajeError && <p className="mensaje-error">{mensajeError}</p>}
        {mensajeExito && <p className="mensaje-exito">{mensajeExito}</p>}
        {cargando && <p>Cargando informacion...</p>}
      </div>

      <div className="admin-form-card" style={{ marginTop: "22px" }}>
        <h2>Crear jornada</h2>
        <form className="admin-form-grid" onSubmit={crearDisponibilidad}>
          <label>ID del médico</label>
          <input
            type="number"
            name="doctor"
            value={disponibilidadForm.doctor}
            onChange={manejarDisponibilidad}
            required
          />

          <label>Especialidad</label>
          <select name="specialty" value={disponibilidadForm.specialty} onChange={manejarDisponibilidad} required>
            <option value="">Selecciona una especialidad</option>
            {especialidades.map((especialidad) => (
              <option key={especialidad.id} value={especialidad.id}>
                {especialidad.name}
              </option>
            ))}
          </select>

          <label>Sede</label>
          <select name="headquarters" value={disponibilidadForm.headquarters} onChange={manejarDisponibilidad}>
            <option value="">Sin sede asignada</option>
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.id}>
                {sede.name}
              </option>
            ))}
          </select>

          <label>Dia</label>
          <select name="weekday" value={disponibilidadForm.weekday} onChange={manejarDisponibilidad}>
            {diasSemana.map((dia) => (
              <option key={dia.value} value={dia.value}>
                {dia.label}
              </option>
            ))}
          </select>

          <label>Hora inicio</label>
          <input type="time" name="start_time" value={disponibilidadForm.start_time} onChange={manejarDisponibilidad} required />

          <label>Hora fin</label>
          <input type="time" name="end_time" value={disponibilidadForm.end_time} onChange={manejarDisponibilidad} required />

          <label>Duracion de cita</label>
          <input
            type="number"
            name="appointment_duration"
            min="1"
            value={disponibilidadForm.appointment_duration}
            onChange={manejarDisponibilidad}
            required
          />

          <label>Consultorio</label>
          <input
            name="consulting_room"
            value={disponibilidadForm.consulting_room}
            onChange={manejarDisponibilidad}
            placeholder="Ej. 204"
          />

          <label>Estado</label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              name="active"
              checked={disponibilidadForm.active}
              onChange={manejarDisponibilidad}
              style={{ width: "auto" }}
            />
            <span>Jornada activa</span>
          </div>

          <button type="submit" className="admin-primary-button">
            Guardar jornada
          </button>
        </form>
      </div>

      <div className="admin-form-card" style={{ marginTop: "22px" }}>
        <h2>Crear excepcion</h2>
        <form className="admin-form-grid" onSubmit={crearExcepcion}>
          <label>ID del médico</label>
          <input type="number" name="doctor" value={excepcionForm.doctor} onChange={manejarExcepcion} required />

          <label>Fecha</label>
          <input type="date" name="date" value={excepcionForm.date} onChange={manejarExcepcion} required />

          <label>Tipo</label>
          <select name="type" value={excepcionForm.type} onChange={manejarExcepcion}>
            <option value="bloqueo">Bloqueo</option>
            <option value="vacaciones">Vacaciones</option>
            <option value="feriado">Feriado</option>
          </select>

          <label>Motivo</label>
          <textarea name="reason" value={excepcionForm.reason} onChange={manejarExcepcion} rows="3" required />

          <button type="submit" className="admin-primary-button">
            Guardar excepcion
          </button>
        </form>
      </div>

      <div className="admin-form-card" style={{ marginTop: "22px" }}>
        <h2>Jornadas registradas</h2>
        <table className="reportes-tabla">
          <thead>
            <tr>
              <th>Especialidad</th>
              <th>Sede</th>
              <th>Dia</th>
              <th>Horario</th>
              <th>Duracion</th>
              <th>Consultorio</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {disponibilidades.length === 0 && (
              <tr>
                <td colSpan="7">No hay jornadas para mostrar.</td>
              </tr>
            )}
            {disponibilidades.map((item) => (
              <tr key={item.id}>
                <td>{item.specialty_name || item.specialty}</td>
                <td>{item.headquarters_name || "Sin sede"}</td>
                <td>{item.weekday_display || item.weekday}</td>
                <td>
                  {item.start_time} - {item.end_time}
                </td>
                <td>{item.appointment_duration} min</td>
                <td>{item.consulting_room || "-"}</td>
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

      <div className="admin-form-card" style={{ marginTop: "22px" }}>
        <h2>Excepciones registradas</h2>
        <table className="reportes-tabla">
          <thead>
            <tr>
              <th>Médico</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {excepciones.length === 0 && (
              <tr>
                <td colSpan="4">No hay excepciones para mostrar.</td>
              </tr>
            )}
            {excepciones.map((item) => (
              <tr key={item.id}>
                <td>{item.doctor_name || item.doctor}</td>
                <td>{item.date}</td>
                <td>{item.type}</td>
                <td>{item.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SuperAdminDisponibilidad;
