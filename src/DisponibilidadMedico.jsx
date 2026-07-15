import { useCallback, useEffect, useState } from "react";
import "./App.css";

const diasSemana = [
    { value: 0, label: "Lunes" },
    { value: 1, label: "Martes" },
    { value: 2, label: "Miercoles" },
    { value: 3, label: "Jueves" },
    { value: 4, label: "Viernes" },
    { value: 5, label: "Sabado" },
    { value: 6, label: "Domingo" },
];

function DisponibilidadMedico() {
    const [especialidades, setEspecialidades] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [disponibilidades, setDisponibilidades] = useState([]);
    const [mensajeError, setMensajeError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");
    const [toastVisible, setToastVisible] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [formulario, setFormulario] = useState({
        specialty: "",
        headquarters: "",
        weekdays: [],
        start_time: "",
        end_time: "",
        appointment_duration: "30",
        consulting_room: "",
        active: true,
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

    const obtenerMensajeError = (data) => {
        if (data?.detail) return data.detail;

        const primerError = Object.values(data || {})[0];
        if (Array.isArray(primerError)) return primerError[0];
        if (typeof primerError === "string") return primerError;

        return "No se pudo guardar la disponibilidad.";
    };

    const cargarDatos = useCallback(async () => {
        setCargando(true);
        setMensajeError("");

        try {
            const token = localStorage.getItem("accessToken");

            if (!token) {
                setMensajeError("No hay una sesion activa. Inicia sesion nuevamente.");
                return;
            }

            const response = await fetch("http://localhost:8000/api/availability/doctor/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await leerRespuesta(response);

            if (!response.ok) {
                setMensajeError(obtenerMensajeError(data));
                return;
            }

            setEspecialidades(data.specialties || []);
            setSedes(data.headquarters || []);
            setDisponibilidades(data.availabilities || []);
        } catch {
            setMensajeError("Error de conexion al cargar la disponibilidad.");
        } finally {
            setCargando(false);
        }
    }, [leerRespuesta]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    useEffect(() => {
        if (!mensajeExito) return;

        setToastVisible(true);
        const timer = setTimeout(() => {
            setToastVisible(false);
            setMensajeExito("");
        }, 4000);

        return () => clearTimeout(timer);
    }, [mensajeExito]);

    const manejarCambio = (e) => {
        const { name, value, type, checked } = e.target;
        setFormulario((actual) => ({
            ...actual,
            [name]: type === "checkbox" ? checked : value,
        }));
        setMensajeError("");
    };

    const manejarCambioDia = (dia) => {
        setFormulario((actual) => {
            const diasActuales = actual.weekdays;
            const diasActualizados = diasActuales.includes(dia)
                ? diasActuales.filter((valor) => valor !== dia)
                : [...diasActuales, dia].sort((a, b) => a - b);

            return {
                ...actual,
                weekdays: diasActualizados,
            };
        });
        setMensajeError("");
    };

    const guardarDisponibilidad = async (e) => {
        e.preventDefault();
        setMensajeError("");
        setMensajeExito("");

        if (
            !formulario.specialty ||
            formulario.weekdays.length === 0 ||
            !formulario.start_time ||
            !formulario.end_time ||
            !formulario.appointment_duration
        ) {
            setMensajeError("Completa especialidad, al menos un dia, hora de inicio, hora de fin y duracion.");
            return;
        }

        if (formulario.start_time >= formulario.end_time) {
            setMensajeError("La hora de fin debe ser posterior a la hora de inicio.");
            return;
        }

        setGuardando(true);

        try {
            const token = localStorage.getItem("accessToken");
            const creadas = [];

            for (const weekday of formulario.weekdays) {
                const body = {
                    specialty: Number(formulario.specialty),
                    weekday,
                    start_time: formulario.start_time,
                    end_time: formulario.end_time,
                    appointment_duration: Number(formulario.appointment_duration),
                    consulting_room: formulario.consulting_room.trim(),
                    active: formulario.active,
                };

                if (formulario.headquarters) {
                    body.headquarters = Number(formulario.headquarters);
                }

                const response = await fetch("http://localhost:8000/api/availability/doctor/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(body),
                });

                const data = await leerRespuesta(response);

                if (!response.ok) {
                    const dia = diasSemana.find((item) => item.value === weekday)?.label || "el dia seleccionado";
                    setMensajeError(`${dia}: ${obtenerMensajeError(data)}`);
                    return;
                }

                creadas.push(data);
            }

            setDisponibilidades((actuales) => [...actuales, ...creadas]);
            setMensajeExito(
                creadas.length === 1
                    ? "Disponibilidad registrada correctamente."
                    : "Disponibilidades registradas correctamente.",
            );
            setFormulario({
                specialty: "",
                headquarters: "",
                weekdays: [],
                start_time: "",
                end_time: "",
                appointment_duration: "30",
                consulting_room: "",
                active: true,
            });
        } catch {
            setMensajeError("Error de conexion al guardar la disponibilidad.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <div className="admin-form-page">
            <div className="admin-form-card">
                <style>{`
                    @keyframes fadeInToast {
                        from { opacity: 0; transform: translateY(-15px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes fadeOutToast {
                        from { opacity: 1; transform: translateY(0); }
                        to { opacity: 0; transform: translateY(-15px); }
                    }
                    .toast-animado {
                        position: fixed;
                        top: 30px;
                        right: 30px;
                        color: white;
                        padding: 14px 28px;
                        border-radius: 50px;
                        box-shadow: 0px 5px 15px rgba(0,0,0,0.25);
                        z-index: 99999;
                        font-weight: bold;
                        font-size: 14px;
                        white-space: nowrap;
                        pointer-events: none;
                        opacity: 0;
                        visibility: hidden;
                        transition: visibility 0.4s;
                    }
                    .toast-animado.entrar {
                        visibility: visible;
                        animation: fadeInToast 0.4s ease-in-out forwards;
                    }
                    .toast-animado.salir {
                        visibility: visible;
                        animation: fadeOutToast 0.4s ease-in-out forwards;
                    }
                `}</style>

                <div
                    className={`toast-animado ${toastVisible ? "entrar" : (mensajeExito ? "salir" : "")}`}
                    style={{ backgroundColor: "#2e7d32" }}
                >
                    {mensajeExito}
                </div>

                <h2>Asignar disponibilidad</h2>
                <p>Registra tus franjas de atencion para que puedan aparecer al agendar citas.</p>

                {mensajeError && <p className="mensaje-error">{mensajeError}</p>}
                {cargando && <p>Cargando disponibilidad...</p>}

                <form onSubmit={guardarDisponibilidad} className="admin-form-grid">
                    <label>Especialidad</label>
                    <select
                        name="specialty"
                        value={formulario.specialty}
                        onChange={manejarCambio}
                    >
                        <option value="">-- Seleccione Especialidad --</option>
                        {especialidades.map((especialidad) => (
                            <option key={especialidad.id} value={especialidad.id}>
                                {especialidad.name}
                            </option>
                        ))}
                    </select>

                    <label>Sede</label>
                    <select
                        name="headquarters"
                        value={formulario.headquarters}
                        onChange={manejarCambio}
                    >
                        <option value="">-- Sin sede asignada --</option>
                        {sedes.map((sede) => (
                            <option key={sede.id} value={sede.id}>
                                {sede.name}
                            </option>
                        ))}
                    </select>

                    <label>Dias de atencion</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "10px" }}>
                        {diasSemana.map((dia) => (
                            <label
                                key={dia.value}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "10px 12px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={formulario.weekdays.includes(dia.value)}
                                    onChange={() => manejarCambioDia(dia.value)}
                                    style={{ width: "auto" }}
                                />
                                {dia.label}
                            </label>
                        ))}
                    </div>

                    <label>Hora de inicio</label>
                    <input
                        type="time"
                        name="start_time"
                        value={formulario.start_time}
                        onChange={manejarCambio}
                    />

                    <label>Hora de fin</label>
                    <input
                        type="time"
                        name="end_time"
                        value={formulario.end_time}
                        onChange={manejarCambio}
                    />

                    <label>Duracion de cita</label>
                    <select
                        name="appointment_duration"
                        value={formulario.appointment_duration}
                        onChange={manejarCambio}
                    >
                        <option value="15">15 minutos</option>
                        <option value="20">20 minutos</option>
                        <option value="30">30 minutos</option>
                        <option value="45">45 minutos</option>
                        <option value="60">60 minutos</option>
                    </select>

                    <label>Consultorio</label>
                    <input
                        type="text"
                        name="consulting_room"
                        value={formulario.consulting_room}
                        onChange={manejarCambio}
                        placeholder="Ej. Consultorio 204"
                    />

                    <label>Estado</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <input
                            type="checkbox"
                            name="active"
                            checked={formulario.active}
                            onChange={manejarCambio}
                            style={{ width: "auto" }}
                        />
                        <span>Disponibilidad activa</span>
                    </div>

                    <button type="submit" className="admin-primary-button" disabled={guardando}>
                        {guardando ? "Guardando..." : "Guardar disponibilidad"}
                    </button>
                </form>
            </div>

            <div className="admin-form-card" style={{ marginTop: "22px" }}>
                <h2>Mis disponibilidades</h2>
                <p>Franjas registradas actualmente para tu agenda.</p>

                {disponibilidades.length === 0 ? (
                    <div className="appointments-empty">
                        <h3>No tienes disponibilidad registrada</h3>
                        <p>Cuando guardes una franja, aparecera en este listado.</p>
                    </div>
                ) : (
                    <table className="reportes-tabla">
                        <thead>
                            <tr>
                                <th>Dia</th>
                                <th>Horario</th>
                                <th>Especialidad</th>
                                <th>Sede</th>
                                <th>Duracion</th>
                                <th>Consultorio</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {disponibilidades.map((disponibilidad) => (
                                <tr key={disponibilidad.id}>
                                    <td>{disponibilidad.weekday_display || diasSemana[disponibilidad.weekday]?.label}</td>
                                    <td>
                                        <strong>
                                            {String(disponibilidad.start_time).slice(0, 5)} - {String(disponibilidad.end_time).slice(0, 5)}
                                        </strong>
                                    </td>
                                    <td>{disponibilidad.specialty_name || "Sin especialidad"}</td>
                                    <td>{disponibilidad.headquarters_name || "Sin sede"}</td>
                                    <td>{disponibilidad.appointment_duration} min</td>
                                    <td>{disponibilidad.consulting_room || "Sin consultorio"}</td>
                                    <td>
                                        <span className={`badge ${disponibilidad.active ? "status-activo" : "status-inactivo"}`}>
                                            {disponibilidad.active ? "Activa" : "Inactiva"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default DisponibilidadMedico;
