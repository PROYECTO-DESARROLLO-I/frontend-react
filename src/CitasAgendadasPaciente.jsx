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
  reprogramada: "Reprogramada",
  rescheduled: "Reprogramada",
};

const normalizar = (valor) =>
  String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const obtenerEstado = (estado) => estadoLabels[normalizar(estado)] || estado || "Sin estado";

const estadoClase = (estado) => normalizar(obtenerEstado(estado)) || "sin-estado";

const obtenerMensajeError = (data, respaldo) => {
  if (data?.detail) return data.detail;

  const primerError = Object.values(data || {})[0];
  if (Array.isArray(primerError)) return primerError[0];
  if (typeof primerError === "string") return primerError;

  return respaldo;
};

const fechaCita = (cita) => new Date(cita.scheduled_at);

const sumarMinutos = (fecha, minutos) => new Date(fecha.getTime() + minutos * 60000);

const formatoInputFecha = (fecha) => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatoDateTimeLocal = (fecha) => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  const hours = String(fecha.getHours()).padStart(2, "0");
  const minutes = String(fecha.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:00`;
};

const generarFranjasSimuladas = (fechaTexto, duracion = 30) => {
  if (!fechaTexto) return [];

  const fecha = new Date(`${fechaTexto}T00:00:00`);
  const hoy = new Date();
  const horasBase = [8, 9, 10, 11, 14, 15, 16];

  return horasBase
    .map((hora, index) => {
      const inicio = new Date(fecha);
      inicio.setHours(hora, index % 2 === 0 ? 0 : 30, 0, 0);
      const fin = sumarMinutos(inicio, duracion);

      return {
        id: `${fechaTexto}-${hora}-${index}`,
        start: inicio,
        end: fin,
        title: `${inicio.toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${fin.toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
      };
    })
    .filter((franja) => franja.start > hoy);
};

function CitasAgendadasPaciente() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [fechaCalendario, setFechaCalendario] = useState(new Date());
  const [vistaCalendario, setVistaCalendario] = useState("month");
  const [modoReprogramacion, setModoReprogramacion] = useState(false);
  const [fechaReprogramacion, setFechaReprogramacion] = useState(formatoInputFecha(new Date()));
  const [franjaReprogramacion, setFranjaReprogramacion] = useState(null);
  const [errorReprogramacion, setErrorReprogramacion] = useState("");
  const [confirmacionReprogramacion, setConfirmacionReprogramacion] = useState("");
  const [modoCancelacion, setModoCancelacion] = useState(false);
  const [errorCancelacion, setErrorCancelacion] = useState("");
  const [confirmacionCancelacion, setConfirmacionCancelacion] = useState("");
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

  const rescheduleEventPropGetter = (event) => ({
    className:
      franjaReprogramacion?.id === event.resource.id
        ? "reschedule-calendar-event selected"
        : "reschedule-calendar-event",
  });

  const franjasReprogramacion = useMemo(
    () => generarFranjasSimuladas(fechaReprogramacion, citaSeleccionada?.duration_minutes || 30),
    [citaSeleccionada, fechaReprogramacion],
  );

  const abrirDetalle = (cita) => {
    setCitaSeleccionada(cita);
    setModoReprogramacion(false);
    setFranjaReprogramacion(null);
    setErrorReprogramacion("");
    setConfirmacionReprogramacion("");
    setModoCancelacion(false);
    setErrorCancelacion("");
    setConfirmacionCancelacion("");
    setFechaReprogramacion(formatoInputFecha(fechaCita(cita)));
  };

  const puedeModificarCita = (cita) => {
    const estado = normalizar(cita?.status);
    return estado !== "cancelada" && estado !== "completada";
  };

  const iniciarReprogramacion = () => {
    if (!puedeModificarCita(citaSeleccionada)) {
      setErrorReprogramacion("Solo puedes reprogramar citas activas o pendientes.");
      return;
    }

    setModoReprogramacion(true);
    setModoCancelacion(false);
    setErrorReprogramacion("");
    setConfirmacionReprogramacion("");
    setErrorCancelacion("");
  };

  const confirmarReprogramacion = async () => {
    if (!franjaReprogramacion) {
      setErrorReprogramacion("Selecciona una franja disponible antes de confirmar.");
      return;
    }

    setCargando(true);
    setErrorReprogramacion("");
    setConfirmacionReprogramacion("");

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `http://localhost:8000/api/appointments/${citaSeleccionada.id}/patient-reschedule/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            scheduled_at: formatoDateTimeLocal(franjaReprogramacion.start),
            reason: "Reprogramacion solicitada por el paciente",
          }),
        },
      );

      const data = await leerRespuesta(response);

      if (!response.ok) {
        setErrorReprogramacion(obtenerMensajeError(data, "No se pudo reprogramar la cita."));
        return;
      }

      const citaActualizada = { ...citaSeleccionada, ...data };

      setCitas((citasActuales) =>
        citasActuales.map((cita) =>
          cita.id === citaActualizada.id ? { ...cita, ...citaActualizada } : cita,
        ),
      );
      setCitaSeleccionada(citaActualizada);
      setFechaCalendario(fechaCita(citaActualizada));
      setModoReprogramacion(false);
      setFranjaReprogramacion(null);
      setConfirmacionReprogramacion("Cita reprogramada correctamente.");
    } catch {
      setErrorReprogramacion("Error de conexion al reprogramar la cita.");
    } finally {
      setCargando(false);
    }
  };

  const iniciarCancelacion = () => {
    if (!puedeModificarCita(citaSeleccionada)) {
      setErrorCancelacion("Esta cita ya no se puede cancelar por su estado actual.");
      return;
    }

    setModoCancelacion(true);
    setModoReprogramacion(false);
    setErrorCancelacion("");
    setErrorReprogramacion("");
    setConfirmacionCancelacion("");
  };

  const confirmarCancelacion = async () => {
    if (!citaSeleccionada) {
      setErrorCancelacion("Selecciona una cita antes de cancelar.");
      return;
    }

    if (!puedeModificarCita(citaSeleccionada)) {
      setErrorCancelacion("Esta cita ya fue cancelada o completada.");
      return;
    }

    setCargando(true);
    setErrorCancelacion("");
    setConfirmacionCancelacion("");

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`http://localhost:8000/api/appointments/${citaSeleccionada.id}/cancel/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: "Cancelacion solicitada por el paciente",
        }),
      });

      const data = await leerRespuesta(response);

      if (!response.ok) {
        setErrorCancelacion(obtenerMensajeError(data, "No se pudo cancelar la cita."));
        return;
      }

      const citaCancelada = {
        ...citaSeleccionada,
        status: "cancelada",
      };

      setCitas((citasActuales) =>
        citasActuales.map((cita) =>
          cita.id === citaCancelada.id ? { ...cita, ...citaCancelada } : cita,
        ),
      );
      setCitaSeleccionada(citaCancelada);
      setModoCancelacion(false);
      setConfirmacionCancelacion(data.detail || "Cita cancelada correctamente.");
    } catch {
      setErrorCancelacion("Error de conexion al cancelar la cita.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="patient-appointments-page">
      <div className="patient-appointments-header">
        <div>
          <h2>Citas agendadas</h2>
          <p>Consulta tus citas en calendario, reprograma o cancela cuando aplique.</p>
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
            onSelectEvent={(evento) => abrirDetalle(evento.resource)}
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

          <div className="appointment-detail-actions">
            <button type="button" className="enviar" onClick={iniciarReprogramacion}>
              Reprogramar cita
            </button>

            <button type="button" className="cancel-appointment-button" onClick={iniciarCancelacion}>
              Cancelar cita
            </button>
          </div>

          {confirmacionReprogramacion && (
            <p className="mensaje-exito">{confirmacionReprogramacion}</p>
          )}

          {confirmacionCancelacion && (
            <p className="mensaje-exito">{confirmacionCancelacion}</p>
          )}

          {errorCancelacion && (
            <p className="mensaje-error">{errorCancelacion}</p>
          )}

          {modoCancelacion && (
            <div className="cancel-confirmation-panel">
              <h4>Confirmar cancelacion</h4>
              <p>
                Esta accion cancelara la cita y actualizara su estado en la agenda.
              </p>

              <div className="cancel-summary">
                <strong>{citaSeleccionada.specialty_name || "Cita medica"}</strong>
                <span>{fechaCita(citaSeleccionada).toLocaleString("es-CO")}</span>
                <span>{citaSeleccionada.doctor_name || "Sin medico"}</span>
              </div>

              <div className="reschedule-actions">
                <button
                  type="button"
                  className="cambiar_horario"
                  onClick={() => {
                    setModoCancelacion(false);
                    setErrorCancelacion("");
                  }}
                >
                  Conservar cita
                </button>
                <button type="button" className="cancel-appointment-button" onClick={confirmarCancelacion}>
                  Confirmar cancelacion
                </button>
              </div>
            </div>
          )}

          {modoReprogramacion && (
            <div className="reschedule-panel">
              <h4>Reprogramar cita</h4>
              <p>
                Selecciona una fecha y una franja disponible para cambiar tu cita.
              </p>

              <label>
                Fecha
                <input
                  type="date"
                  value={fechaReprogramacion}
                  min={formatoInputFecha(new Date())}
                  onChange={(e) => {
                    setFechaReprogramacion(e.target.value);
                    setFranjaReprogramacion(null);
                    setErrorReprogramacion("");
                  }}
                />
              </label>

              {errorReprogramacion && (
                <p className="mensaje-error">{errorReprogramacion}</p>
              )}

              {franjasReprogramacion.length === 0 ? (
                <div className="appointments-empty">
                  <h3>No hay horarios disponibles</h3>
                  <p>Selecciona otra fecha para consultar nuevas franjas.</p>
                </div>
              ) : (
                <>
                  <div className="reschedule-calendar">
                    <Calendar
                      localizer={localizer}
                      events={franjasReprogramacion.map((franja) => ({
                        ...franja,
                        resource: franja,
                      }))}
                      startAccessor="start"
                      endAccessor="end"
                      date={new Date(`${fechaReprogramacion}T00:00:00`)}
                      view="day"
                      views={["day"]}
                      toolbar={false}
                      onSelectEvent={(evento) => {
                        setFranjaReprogramacion(evento.resource);
                        setErrorReprogramacion("");
                      }}
                      eventPropGetter={rescheduleEventPropGetter}
                      min={new Date(1970, 0, 1, 7, 0)}
                      max={new Date(1970, 0, 1, 18, 0)}
                      step={30}
                      timeslots={1}
                      messages={{
                        noEventsInRange: "No hay franjas disponibles en esta fecha.",
                      }}
                      style={{ height: 360 }}
                    />
                  </div>

                  <div className="reschedule-slots">
                    {franjasReprogramacion.map((franja) => (
                      <button
                        key={franja.id}
                        type="button"
                        className={
                          franjaReprogramacion?.id === franja.id
                            ? "reschedule-slot selected"
                            : "reschedule-slot"
                        }
                        onClick={() => {
                          setFranjaReprogramacion(franja);
                          setErrorReprogramacion("");
                        }}
                      >
                        {franja.title}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {franjaReprogramacion && (
                <div className="reschedule-confirmation">
                  <strong>Nuevo horario seleccionado</strong>
                  <span>{franjaReprogramacion.start.toLocaleString("es-CO")}</span>
                </div>
              )}

              <div className="reschedule-actions">
                <button
                  type="button"
                  className="cambiar_horario"
                  onClick={() => {
                    setModoReprogramacion(false);
                    setFranjaReprogramacion(null);
                    setErrorReprogramacion("");
                  }}
                >
                  Cancelar
                </button>
                <button type="button" className="enviar" onClick={confirmarReprogramacion}>
                  Confirmar cambio
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CitasAgendadasPaciente;
