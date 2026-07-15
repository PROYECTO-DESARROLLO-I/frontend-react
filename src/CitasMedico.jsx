import { useCallback, useEffect, useState } from "react";
import "./App.css";

function CitasMedico() {
    const [citas, setCitas] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [mensajeError, setMensajeError] = useState("");

    const leerRespuesta = useCallback(async (response) => {
        const text = await response.text();
        if (!text) return {};

        try {
            return JSON.parse(text);
        } catch {
            return { detail: text };
        }
    }, []);

    const obtenerEstado = (estado) => {
        const estados = {
            confirmada: "Confirmada",
            confirmed: "Confirmada",
            pendiente: "Pendiente",
            pending: "Pendiente",
            cancelada: "Cancelada",
            cancelled: "Cancelada",
            canceled: "Cancelada",
            atendida: "Atendida",
            attended: "Atendida",
            reprogramada: "Reprogramada",
            rescheduled: "Reprogramada",
        };

        return estados[String(estado || "").toLowerCase()] || estado || "Sin estado";
    };

    const obtenerClaseEstado = (estado) => {
        const estadoNormalizado = obtenerEstado(estado)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        if (estadoNormalizado === "confirmada" || estadoNormalizado === "programada") {
            return "status-programada";
        }

        if (estadoNormalizado === "atendida") {
            return "status-realizada";
        }

        if (estadoNormalizado === "cancelada") {
            return "status-cancelada";
        }

        return "status-incumplida";
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return "Sin fecha";

        return new Date(fecha).toLocaleDateString("es-CO", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };

    const formatearHora = (fecha) => {
        if (!fecha) return "Sin hora";

        return new Date(fecha).toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const cargarCitas = useCallback(async () => {
        setCargando(true);
        setMensajeError("");

        try {
            const token = localStorage.getItem("accessToken");

            if (!token) {
                setMensajeError("No hay una sesion activa. Inicia sesion nuevamente.");
                return;
            }

            const response = await fetch("http://localhost:8000/api/appointments/doctor/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await leerRespuesta(response);

            if (!response.ok) {
                setMensajeError(data.detail || "No se pudieron cargar las citas del medico.");
                return;
            }

            setCitas(Array.isArray(data) ? data : []);
        } catch {
            setMensajeError("Error de conexion al cargar las citas del medico.");
        } finally {
            setCargando(false);
        }
    }, [leerRespuesta]);

    useEffect(() => {
        cargarCitas();
    }, [cargarCitas]);

    return (
        <div className="admin-form-page animate-aparecer">
            <h2>Mi Agenda de Consultas</h2>
            <p>Consulta las citas asignadas a tu agenda medica.</p>

            <button
                type="button"
                className="admin-primary-button"
                onClick={cargarCitas}
                disabled={cargando}
                style={{ width: "auto", padding: "10px 24px", marginBottom: "18px" }}
            >
                {cargando ? "Actualizando..." : "Actualizar agenda"}
            </button>

            {mensajeError && <p className="mensaje-error">{mensajeError}</p>}

            {!cargando && citas.length === 0 && !mensajeError && (
                <div className="appointments-empty">
                    <h3>No tienes citas asignadas</h3>
                    <p>Cuando se agenden citas contigo, apareceran en esta tabla.</p>
                </div>
            )}

            {citas.length > 0 && (
                <table className="reportes-tabla">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Paciente</th>
                            <th>Especialidad</th>
                            <th>Duracion</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {citas.map((cita) => (
                            <tr key={cita.id}>
                                <td>{formatearFecha(cita.scheduled_at)}</td>
                                <td><strong>{formatearHora(cita.scheduled_at)}</strong></td>
                                <td>{cita.patient_name || "Paciente sin nombre"}</td>
                                <td>{cita.specialty_name || "Sin especialidad"}</td>
                                <td>{cita.duration_minutes || 30} min</td>
                                <td>
                                    <span className={`badge ${obtenerClaseEstado(cita.status)}`}>
                                        {obtenerEstado(cita.status)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default CitasMedico;
