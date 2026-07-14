import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./App.css";

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const estadoLabels = {
  confirmada: "Confirmada",
  confirmed: "Confirmada",
  pendiente: "Pendiente",
  pending: "Pendiente",
  cancelada: "Cancelada",
  canceled: "Cancelada",
  cancelled: "Cancelada",
  completada: "Completada",
  completed: "Completada",
};

const normalizar = (valor) =>
  String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const obtenerEstado = (estado) => estadoLabels[normalizar(estado)] || estado || "Sin estado";

const estadoClase = (estado) => normalizar(obtenerEstado(estado)) || "sin-estado";

const fechaCita = (cita) => new Date(cita.scheduled_at);

const sumarMinutos = (fecha, minutos) => new Date(fecha.getTime() + minutos * 60000);

function CitasAgendadasPaciente() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [fechaCalendario, setFechaCalendario] = useState(new Date());
  const [vistaCalendario, setVistaCalendario] = useState("month");
  const [filtros, setFiltros] = useState({
    especialidad: "",
    medico: "",
    estado: "",
    sede: "",
  });

  const leerRespuesta = useCallback(async (response) => {
    const text = await response.text();
    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      return { detail: text };
    }
  }, []);

  const cargarDetalle = useCallback(async (cita, token) => {
    try {
      const response = await fetch(`http://localhost:8000/api/appointments/${cita.id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return cita;

      const detalle = await leerRespuesta(response);
      return { ...cita, ...detalle };
    } catch {
      return cita;
    }
  }, [leerRespuesta]);

  const cargarCitas = useCallback(async () => {
    setCargando(true);
    setMensajeError("");

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://localhost:8000/api/appointments/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await leerRespuesta(response);

      if (!response.ok) {
        setMensajeError(data.detail || "No se pudieron cargar tus citas.");
        return;
      }

      const detalles = await Promise.all(
        data.map((cita) => cargarDetalle(cita, token)),
      );

      setCitas(detalles);
    } catch {
      setMensajeError("Error de conexion al cargar tus citas.");
    } finally {
      setCargando(false);
    }
  }, [cargarDetalle, leerRespuesta]);

  useEffect(() => {
    cargarCitas();
  }, [cargarCitas]);

  const opcionesFiltro = useMemo(() => {
    const crearOpciones = (campo) =>
      [...new Set(citas.map((cita) => cita[campo]).filter(Boolean))].sort();

    return {
      especialidades: crearOpciones("specialty_name"),
      medicos: crearOpciones("doctor_name"),
      estados: [...new Set(citas.map((cita) => obtenerEstado(cita.status)).filter(Boolean))].sort(),
      sedes: crearOpciones("headquarters_name"),
    };
  }, [citas]);

  const citasFiltradas = useMemo(
    () =>
      citas.filter((cita) => {
        const estado = obtenerEstado(cita.status);

        return (
          (!filtros.especialidad || cita.specialty_name === filtros.especialidad) &&
          (!filtros.medico || cita.doctor_name === filtros.medico) &&
          (!filtros.estado || estado === filtros.estado) &&
          (!filtros.sede || cita.headquarters_name === filtros.sede)
        );
      }),
    [citas, filtros],
  );

  const eventos = useMemo(
    () =>
      citasFiltradas.map((cita) => {
        const inicio = fechaCita(cita);
        const fin = sumarMinutos(inicio, cita.duration_minutes || 30);

        return {
          id: cita.id,
          title: `${cita.specialty_name || "Cita"} - ${obtenerEstado(cita.status)}`,
          start: inicio,
          end: fin,
          resource: cita,
        };
      }),
    [citasFiltradas],
  );

  const limpiarFiltros = () => {
    setFiltros({
      especialidad: "",
      medico: "",
      estado: "",
      sede: "",
    });
  };

  const eventPropGetter = (event) => ({
    className: `cita-evento cita-evento-${estadoClase(event.resource.status)}`,
  });

  return (
    <div className="patient-appointments-page">
      <div className="patient-appointments-header">
        <div>
          <h2>Citas agendadas</h2>
          <p>Consulta tus citas en calendario y filtra por los datos principales.</p>
        </div>

        <button type="button" className="admin-primary-button" onClick={cargarCitas}>
          Actualizar
        </button>
      </div>

      {mensajeError && <p className="mensaje-error">{mensajeError}</p>}

      <div className="appointments-filters">
        <select
          value={filtros.especialidad}
          onChange={(e) => setFiltros({ ...filtros, especialidad: e.target.value })}
        >
          <option value="">Todas las especialidades</option>
          {opcionesFiltro.especialidades.map((especialidad) => (
            <option key={especialidad} value={especialidad}>
              {especialidad}
            </option>
          ))}
        </select>

        <select
          value={filtros.medico}
          onChange={(e) => setFiltros({ ...filtros, medico: e.target.value })}
        >
          <option value="">Todos los medicos</option>
          {opcionesFiltro.medicos.map((medico) => (
            <option key={medico} value={medico}>
              {medico}
            </option>
          ))}
        </select>

        <select
          value={filtros.estado}
          onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
        >
          <option value="">Todos los estados</option>
          {opcionesFiltro.estados.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>

        <select
          value={filtros.sede}
          onChange={(e) => setFiltros({ ...filtros, sede: e.target.value })}
        >
          <option value="">Todas las sedes</option>
          {opcionesFiltro.sedes.map((sede) => (
            <option key={sede} value={sede}>
              {sede}
            </option>
          ))}
        </select>

        <button type="button" className="cambiar_horario" onClick={limpiarFiltros}>
          Limpiar filtros
        </button>
      </div>

      <div className="appointment-status-legend">
        <span className="legend-dot cita-evento-confirmada" /> Confirmada
        <span className="legend-dot cita-evento-pendiente" /> Pendiente
        <span className="legend-dot cita-evento-cancelada" /> Cancelada
        <span className="legend-dot cita-evento-completada" /> Completada
      </div>

      {cargando && <p>Cargando citas...</p>}

      {!cargando && citas.length === 0 && (
        <div className="appointments-empty">
          <h3>No tienes citas agendadas</h3>
          <p>Cuando reserves una cita, aparecera en este calendario.</p>
        </div>
      )}

      {!cargando && citas.length > 0 && citasFiltradas.length === 0 && (
        <div className="appointments-empty">
          <h3>No hay citas con esos filtros</h3>
          <p>Ajusta los filtros para ver otros resultados.</p>
        </div>
      )}

      {citas.length > 0 && (
        <div className="appointments-calendar-shell">
          <Calendar
            localizer={localizer}
            events={eventos}
            startAccessor="start"
            endAccessor="end"
            date={fechaCalendario}
            view={vistaCalendario}
            views={["day", "week", "month"]}
            onNavigate={setFechaCalendario}
            onView={setVistaCalendario}
            onSelectEvent={(evento) => setCitaSeleccionada(evento.resource)}
            eventPropGetter={eventPropGetter}
            messages={{
              next: "Siguiente",
              previous: "Anterior",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Dia",
              noEventsInRange: "No hay citas en este periodo.",
            }}
            popup
            style={{ height: 560 }}
          />
        </div>
      )}

      {citaSeleccionada && (
        <div className="appointment-detail-panel">
          <div>
            <h3>{citaSeleccionada.specialty_name || "Detalle de cita"}</h3>
            <p>{obtenerEstado(citaSeleccionada.status)}</p>
          </div>

          <dl>
            <dt>Medico</dt>
            <dd>{citaSeleccionada.doctor_name || "Sin medico"}</dd>
            <dt>Fecha y hora</dt>
            <dd>{fechaCita(citaSeleccionada).toLocaleString("es-CO")}</dd>
            <dt>Duracion</dt>
            <dd>{citaSeleccionada.duration_minutes || 30} minutos</dd>
            <dt>Sede</dt>
            <dd>{citaSeleccionada.headquarters_name || "Sin sede"}</dd>
            <dt>Motivo</dt>
            <dd>{citaSeleccionada.consultation_reason || "Sin motivo registrado"}</dd>
            <dt>Notas</dt>
            <dd>{citaSeleccionada.notes || "Sin notas"}</dd>
          </dl>

          <button type="button" className="cambiar_horario" onClick={() => setCitaSeleccionada(null)}>
            Cerrar detalle
          </button>
        </div>
      )}
    </div>
  );
}

export default CitasAgendadasPaciente;
