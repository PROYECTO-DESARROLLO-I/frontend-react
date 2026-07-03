import { useEffect, useMemo, useState } from "react";
import "./App.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const calendarMinTime = new Date(1970, 0, 1, 6, 0);
const calendarMaxTime = new Date(1970, 0, 1, 19, 0);
const calendarScrollTime = new Date(1970, 0, 1, 11, 30);

function AgendamientoCitas({ patientId, volverAlDashboard }) {
  const totalPasos = 4;
  const [pasoActual, setPasoActual] = useState(1);
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [franjas, setFranjas] = useState([]);

  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(null);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
  const [franjaSeleccionada, setFranjaSeleccionada] = useState(null);
  const [fechaBase, setFechaBase] = useState(new Date());
  const [vistaCalendario, setVistaCalendario] = useState("week");
  const [citaCreada, setCitaCreada] = useState(null);

  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);

  const progreso = (pasoActual / totalPasos) * 100;

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

  const obtenerToken = () => localStorage.getItem("accessToken");

  const fechaIso = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const eventosCalendario = useMemo(
    () =>
      franjas.map((franja, index) => ({
        id: `${franja.date}-${franja.start_time}-${index}`,
        title: `${franja.start_time.slice(0, 5)} - ${franja.end_time.slice(0, 5)}`,
        start: new Date(`${franja.date}T${franja.start_time}`),
        end: new Date(`${franja.date}T${franja.end_time}`),
        resource: franja,
      })),
    [franjas],
  );

  useEffect(() => {
    const cargarEspecialidades = async () => {
      setCargando(true);
      setMensajeError("");

      try {
        const response = await fetch("http://localhost:8000/api/specialties/", {
          headers: {
            Authorization: `Bearer ${obtenerToken()}`,
          },
        });

        const data = await leerRespuesta(response);

        if (!response.ok) {
          setMensajeError(
            obtenerMensajeError(data, "No se pudieron cargar las especialidades."),
          );
          return;
        }

        setEspecialidades(data);
      } catch {
        setMensajeError("Error de conexion al cargar especialidades.");
      } finally {
        setCargando(false);
      }
    };

    cargarEspecialidades();
  }, []);

  const cargarDisponibilidad = async (
    medicoId,
    especialidadId,
    fecha,
    vista,
  ) => {
    setCargando(true);
    setMensajeError("");

    try {
      const params = new URLSearchParams({
        doctor: medicoId,
        specialty: especialidadId,
        date: fechaIso(fecha),
        view: vista,
      });

      const response = await fetch(
        `http://localhost:8000/api/availability/slots/?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${obtenerToken()}`,
          },
        },
      );

      const data = await leerRespuesta(response);

      if (!response.ok) {
        setMensajeError(
          obtenerMensajeError(data, "No se pudo cargar la disponibilidad."),
        );
        return;
      }

      setFranjas(data.slots || []);
    } catch {
      setMensajeError("Error de conexion al cargar disponibilidad.");
    } finally {
      setCargando(false);
    }
  };

  const seleccionarEspecialidad = async (especialidad) => {
    setEspecialidadSeleccionada(especialidad);
    setMedicoSeleccionado(null);
    setFranjaSeleccionada(null);
    setCitaCreada(null);
    setFranjas([]);
    setPasoActual(2);
    setCargando(true);
    setMensajeError("");

    try {
      const response = await fetch(
        `http://localhost:8000/api/doctors/?specialty=${especialidad.id}`,
        {
          headers: {
            Authorization: `Bearer ${obtenerToken()}`,
          },
        },
      );

      const data = await leerRespuesta(response);

      if (!response.ok) {
        setMensajeError(obtenerMensajeError(data, "No se pudieron cargar los medicos."));
        return;
      }

      setMedicos(data);
    } catch {
      setMensajeError("Error de conexion al cargar medicos.");
    } finally {
      setCargando(false);
    }
  };

  const seleccionarMedico = async (medico) => {
    setMedicoSeleccionado(medico);
    setFranjaSeleccionada(null);
    setCitaCreada(null);
    setPasoActual(3);
    await cargarDisponibilidad(
      medico.id,
      especialidadSeleccionada.id,
      fechaBase,
      vistaCalendario,
    );
  };

  const seleccionarFranja = (evento) => {
    setFranjaSeleccionada(evento.resource);
    setMensajeError("");
    setPasoActual(4);
  };

  const confirmarCita = async () => {
    if (!franjaSeleccionada) {
      setMensajeError("Selecciona una franja horaria antes de confirmar.");
      return;
    }

    setCargando(true);
    setMensajeError("");

    const scheduledAt = `${franjaSeleccionada.date}T${franjaSeleccionada.start_time}`;
    const body = {
      doctor_id: medicoSeleccionado.id,
      specialty_id: especialidadSeleccionada.id,
      scheduled_at: scheduledAt,
      consultation_reason: "Cita agendada",
    };

    if (patientId) {
      body.patient_id = patientId;
    }

    try {
      const response = await fetch("http://localhost:8000/api/appointments/book/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(body),
      });

      const data = await leerRespuesta(response);

      if (!response.ok) {
        setMensajeError(obtenerMensajeError(data, "No se pudo crear la cita."));
        return;
      }

      setCitaCreada(data);
      setFranjaSeleccionada(null);
      await cargarDisponibilidad(
        medicoSeleccionado.id,
        especialidadSeleccionada.id,
        fechaBase,
        vistaCalendario,
      );
    } catch {
      setMensajeError("Error de conexion al crear la cita.");
    } finally {
      setCargando(false);
    }
  };

  const cambiarVistaCalendario = (vista) => {
    setVistaCalendario(vista);

    if (medicoSeleccionado && especialidadSeleccionada) {
      cargarDisponibilidad(
        medicoSeleccionado.id,
        especialidadSeleccionada.id,
        fechaBase,
        vista,
      );
    }
  };

  const cambiarFecha = (fecha) => {
    setFechaBase(fecha);

    if (medicoSeleccionado && especialidadSeleccionada) {
      cargarDisponibilidad(
        medicoSeleccionado.id,
        especialidadSeleccionada.id,
        fecha,
        vistaCalendario,
      );
    }
  };

  const volverPasoAnterior = () => {
    setMensajeError("");
    setCitaCreada(null);

    if (pasoActual === 1) {
      volverAlDashboard();
      return;
    }

    if (pasoActual === 2) {
      setMedicos([]);
      setEspecialidadSeleccionada(null);
    }

    if (pasoActual === 3) {
      setFranjas([]);
      setMedicoSeleccionado(null);
    }

    if (pasoActual === 4) {
      setFranjaSeleccionada(null);
    }

    setPasoActual((paso) => Math.max(1, paso - 1));
  };

  return (
    <div className="form-citas">
      <div className="admin-back" onClick={volverPasoAnterior}>
        Volver
      </div>

      <div className="progreso">
        Paso {pasoActual} de {totalPasos}
      </div>

      <div className="barra-progreso">
        <div
          className="barra-progreso-llena"
          style={{ width: `${progreso}%` }}
        />
      </div>

      <h2>Agendar cita</h2>

      {mensajeError && <p className="mensaje-error">{mensajeError}</p>}
      {cargando && <p>Cargando...</p>}

      {pasoActual === 1 && (
        <section>
          <h3>Selecciona una especialidad</h3>

          {!cargando && especialidades.length === 0 && (
            <p>No hay especialidades disponibles en este momento.</p>
          )}

          <div className="citas-card-grid">
            {especialidades.map((especialidad) => (
              <button
                className="citas-option-card"
                key={especialidad.id}
                type="button"
                onClick={() => seleccionarEspecialidad(especialidad)}
              >
                {especialidad.name}
                {especialidad.available_doctors_count !== undefined &&
                  ` - ${especialidad.available_doctors_count} medicos disponibles`}
              </button>
            ))}
          </div>
        </section>
      )}

      {pasoActual === 2 && (
        <section>
          <h3>Selecciona un medico</h3>

          {!cargando && medicos.length === 0 && (
            <p>No hay medicos disponibles para esta especialidad.</p>
          )}

          <div className="citas-card-grid">
            {medicos.map((medico) => (
              <button
                className="citas-option-card"
                key={medico.id}
                type="button"
                onClick={() => seleccionarMedico(medico)}
              >
                {medico.full_name}
                {medico.available_slots_count !== undefined &&
                  ` - ${medico.available_slots_count} franjas disponibles`}
              </button>
            ))}
          </div>
        </section>
      )}

      {pasoActual === 3 && (
        <section>
          <h3>Selecciona una franja horaria</h3>

      

          <Calendar
            localizer={localizer}
            events={eventosCalendario}
            startAccessor="start"
            endAccessor="end"
            date={fechaBase}
            view={vistaCalendario}
            views={["week", "month", "day"]}
            onNavigate={cambiarFecha}
            onView={cambiarVistaCalendario}
            onSelectEvent={seleccionarFranja}
            min={calendarMinTime}
            max={calendarMaxTime}
            scrollToTime={calendarScrollTime}
            step={30}
            timeslots={1}
            messages={{
              next: "Siguiente",
              previous: "Anterior",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Dia",
              noEventsInRange: "No hay franjas disponibles en este rango.",
            }}
            style={{ height: 520 }}
          />

          {!cargando && franjas.length === 0 && (
            <p>No hay franjas disponibles para esta fecha.</p>
          )}
        </section>
      )}

      {pasoActual === 4 && (
        <section>
          {citaCreada ? (
            <div>
              <h3>Cita creada</h3>
              <p>Tu cita fue agendada correctamente.</p>
              <button
                type="button"
                onClick={() => {
                  setPasoActual(1);
                  setEspecialidadSeleccionada(null);
                  setMedicoSeleccionado(null);
                  setFranjaSeleccionada(null);
                  setCitaCreada(null);
                  setFranjas([]);
                  setMedicos([]);
                }}
              >
                Agendar otra cita
              </button>
            </div>
          ) : (
            <div>
              <h3>Confirmar cita</h3>

              {franjaSeleccionada && (
                <>
                  <p>Especialidad: {especialidadSeleccionada.name}</p>
                  <p>Medico: {medicoSeleccionado.full_name}</p>
                  <p>Fecha: {franjaSeleccionada.date}</p>
                  <p>Hora: {franjaSeleccionada.start_time}</p>
                  <p>Sede: {franjaSeleccionada.headquarters_name || "Sin sede"}</p>
                </>
              )}

              <div className="botones-pasos">
                <button type="button" onClick={() => setPasoActual(3)}>
                  Cambiar horario
                </button>
                <button type="button" onClick={confirmarCita}>
                  Confirmar cita
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default AgendamientoCitas;
