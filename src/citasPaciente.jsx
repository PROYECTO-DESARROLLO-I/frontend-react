import { useEffect, useState } from "react";
import "./App.css";

function CitasPaciente({ volverAlDashboard }) {
  const [paso, setPaso] = useState("especialidad");

  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [franjas, setFranjas] = useState([]);

  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(null);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
  const [franjaSeleccionada, setFranjaSeleccionada] = useState(null);

  const [fechaBase, setFechaBase] = useState(new Date().toISOString().split("T")[0]);
  const [vistaCalendario, setVistaCalendario] = useState("week");

  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    cargarEspecialidades();
  }, []);

  const cargarEspecialidades = async () => {
    setCargando(true);
    setMensajeError("");

    try {
      const response = await fetch("http://localhost:8000/api/specialties/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMensajeError(data.detail || "No se pudieron cargar las especialidades.");
        return;
      }

      setEspecialidades(data);
    } catch {
      setMensajeError("Error de conexion al cargar especialidades.");
    } finally {
      setCargando(false);
    }
  };

  const seleccionarEspecialidad = async (especialidad) => {
    setEspecialidadSeleccionada(especialidad);
    setMedicoSeleccionado(null);
    setFranjaSeleccionada(null);
    setFranjas([]);
    setPaso("medico");

    setCargando(true);
    setMensajeError("");

    try {
      const response = await fetch(
        `http://localhost:8000/api/doctors/?specialty=${especialidad.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMensajeError(data.detail || "No se pudieron cargar los medicos.");
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
    setPaso("calendario");
    await cargarDisponibilidad(medico.id, especialidadSeleccionada.id, fechaBase, vistaCalendario);
  };

  const cargarDisponibilidad = async (
    medicoId,
    especialidadId,
    fecha,
    vista
  ) => {
    setCargando(true);
    setMensajeError("");

    try {
      const params = new URLSearchParams({
        doctor: medicoId,
        specialty: especialidadId,
        date: fecha,
        view: vista,
      });

      const response = await fetch(
        `http://localhost:8000/api/availability/slots/?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMensajeError(data.detail || "No se pudo cargar la disponibilidad.");
        return;
      }

      setFranjas(data.slots || []);
    } catch {
      setMensajeError("Error de conexion al cargar disponibilidad.");
    } finally {
      setCargando(false);
    }
  };

  const seleccionarFranja = (franja) => {
    setFranjaSeleccionada(franja);
    setPaso("confirmacion");
  };

  const confirmarCita = async () => {
    if (!medicoSeleccionado || !especialidadSeleccionada || !franjaSeleccionada) {
      setMensajeError("Selecciona especialidad, medico y horario.");
      return;
    }

    setCargando(true);
    setMensajeError("");

    try {
      const scheduledAt = `${franjaSeleccionada.date}T${franjaSeleccionada.start_time}`;

      const response = await fetch("http://localhost:8000/api/appointments/book/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctor_id: medicoSeleccionado.id,
          specialty_id: especialidadSeleccionada.id,
          scheduled_at: scheduledAt,
          consultation_reason: "Cita agendada desde paciente",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensajeError(data.detail || "No se pudo crear la cita.");
        return;
      }

      setPaso("detalle");
      setFranjaSeleccionada(null);
      await cargarDisponibilidad(
        medicoSeleccionado.id,
        especialidadSeleccionada.id,
        fechaBase,
        vistaCalendario
      );

      console.log("Cita creada:", data);
    } catch {
      setMensajeError("Error de conexion al crear la cita.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="admin-form-page">
      <div className="admin-back" onClick={volverAlDashboard}>
        <p>Volver</p>
      </div>

      <div className="admin-form-card">
        <h2>Agendar cita</h2>

        {mensajeError && <p className="mensaje-error">{mensajeError}</p>}
        {cargando && <p>Cargando...</p>}

        {paso === "especialidad" && (
          <div>
            <h3>Selecciona una especialidad</h3>

            {especialidades.map((especialidad) => (
              <button className="admin-card"
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
        )}

        {paso === "medico" && (
          <div>
            <h3>Selecciona un medico</h3>

            <button  type="button" onClick={() => setPaso("especialidad")}>
              Cambiar especialidad
            </button>

            {medicos.map((medico) => (
              <button
                

                key={medico.id}
                type="button"
                onClick={() => seleccionarMedico(medico)}
              >
                {medico.full_name}
                {medico.next_available_date &&
                  ` - Proxima disponibilidad: ${medico.next_available_date}`}
              </button>
            ))}
          </div>
        )}

        {paso === "calendario" && (
          <div>
            <h3>Selecciona una franja horaria</h3>

            <div>
              <button
                type="button"
                onClick={() => {
                  setVistaCalendario("week");
                  cargarDisponibilidad(
                    medicoSeleccionado.id,
                    especialidadSeleccionada.id,
                    fechaBase,
                    "week"
                  );
                }}
              >
                Semana
              </button>

              <button
                type="button"
                onClick={() => {
                  setVistaCalendario("month");
                  cargarDisponibilidad(
                    medicoSeleccionado.id,
                    especialidadSeleccionada.id,
                    fechaBase,
                    "month"
                  );
                }}
              >
                Mes
              </button>
            </div>

            <input
              type="date"
              value={fechaBase}
              onChange={(e) => {
                setFechaBase(e.target.value);
                cargarDisponibilidad(
                  medicoSeleccionado.id,
                  especialidadSeleccionada.id,
                  e.target.value,
                  vistaCalendario
                );
              }}
            />

            {franjas.map((franja, index) => (
              <button
                key={`${franja.date}-${franja.start_time}-${index}`}
                type="button"
                onClick={() => seleccionarFranja(franja)}
              >
                {franja.date} - {franja.start_time} a {franja.end_time}
                {franja.headquarters_name && ` - ${franja.headquarters_name}`}
              </button>
            ))}
          </div>
        )}

        {paso === "confirmacion" && franjaSeleccionada && (
          <div>
            <h3>Confirmar cita</h3>

            <p>Especialidad: {especialidadSeleccionada.name}</p>
            <p>Medico: {medicoSeleccionado.full_name}</p>
            <p>Fecha: {franjaSeleccionada.date}</p>
            <p>Hora: {franjaSeleccionada.start_time}</p>
            <p>Sede: {franjaSeleccionada.headquarters_name}</p>

            <button type="button" onClick={() => setPaso("calendario")}>
              Cambiar horario
            </button>

            <button type="button" onClick={confirmarCita}>
              Confirmar cita
            </button>
          </div>
        )}

        {paso === "detalle" && (
          <div>
            <h3>Cita creada</h3>
            <p>Tu cita fue agendada correctamente.</p>

            <button type="button" onClick={() => setPaso("especialidad")}>
              Agendar otra cita
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CitasPaciente;