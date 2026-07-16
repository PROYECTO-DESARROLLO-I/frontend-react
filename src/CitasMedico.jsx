import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";

const normalizar = (valor) =>
    String(valor || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const obtenerMensajeError = (data, respaldo) => {
    if (data?.detail) return data.detail;
    const primerError = Object.values(data || {})[0];
    if (Array.isArray(primerError)) return primerError[0];
    if (typeof primerError === "string") return primerError;
    return respaldo;
};

const fechaCita = (cita) => (cita?.scheduled_at ? new Date(cita.scheduled_at) : new Date());

//noinspection DuplicatedCode
const sumarMinutos = (fecha, minutos) => new Date(fecha.getTime() + minutos * 60000);

const decodificarJWT = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error al decodificar el token JWT:", e);
        return null;
    }
};

//noinspection DuplicatedCode
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

function CitasMedico() {
    const [citas, setCitas] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [mensajeError, setMensajeError] = useState("");
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);

    const [modoReprogramacion, setModoReprogramacion] = useState(false);
    const [fechaReprogramacion, setFechaReprogramacion] = useState(formatoInputFecha(new Date()));
    const [franjasDisponibles, setFranjasDisponibles] = useState([]);
    const [cargandoFranjas, setCargandoFranjas] = useState(false);
    const [franjaReprogramacion, setFranjaReprogramacion] = useState(null);
    const [errorReprogramacion, setErrorReprogramacion] = useState("");
    const [confirmacionReprogramacion, setConfirmacionReprogramacion] = useState("");

    const [modoCancelacion, setModoCancelacion] = useState(false);
    const [motivoCancelacion, setMotivoCancelacion] = useState("");
    const [errorCancelacion, setErrorCancelacion] = useState("");
    const [confirmacionCancelacion, setConfirmacionCancelacion] = useState("");
    const reprogramacionRef = useRef(null);
    const cancelacionRef = useRef(null);

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
                setMensajeError("No hay una sesión activa. Inicia sesión nuevamente.");
                return;
            }

            const response = await fetch("http://localhost:8000/api/appointments/doctor/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await leerRespuesta(response);
            if (!response.ok) {
                setMensajeError(data.detail || "No se pudieron cargar las citas del médico.");
                return;
            }
            setCitas(Array.isArray(data) ? data : []);
        } catch {
            setMensajeError("Error de conexión al cargar las citas del médico.");
        } finally {
            setCargando(false);
        }
    }, [leerRespuesta]);

    // MÉTODO DEFINITIVO: Mapeo de IDs + Envío opcional de Sede + Extracción correcta de data.slots
    const cargarDisponibilidadReal = useCallback(async (fechaStr, signal) => {
        if (!fechaStr || !citaSeleccionada) return;
        setCargandoFranjas(true);
        setErrorReprogramacion("");
        try {
            const token = localStorage.getItem("accessToken");

            // 1. Obtener el ID del Usuario logueado desde el JWT (ej: 9)
            let usuarioId = null;
            if (token) {
                const tokenDecodificado = decodificarJWT(token);
                if (tokenDecodificado) {
                    usuarioId = tokenDecodificado.user_id || tokenDecodificado.id;
                }
            }

            // 2. BUSCAR EL ID DE LA ESPECIALIDAD SEGÚN EL TEXTO (ej: "Medicina General")
            let specialtyId = null;
            const nombreEspecialidadCita = citaSeleccionada.specialty_name;

            if (nombreEspecialidadCita) {
                try {
                    const specRes = await fetch("http://localhost:8000/api/specialties/", {
                        headers: { Authorization: `Bearer ${token}` },
                        signal
                    });
                    if (specRes.ok) {
                        const specs = await specRes.json();
                        const encontrada = specs.find(s => {
                            const nombreApi = s.name || s.nombre || "";
                            return nombreApi.toLowerCase().trim() === nombreEspecialidadCita.toLowerCase().trim();
                        });
                        if (encontrada) {
                            specialtyId = encontrada.id;
                        }
                    }
                } catch (errSpecs) {
                    console.warn("No se pudo mapear la especialidad por nombre", errSpecs);
                }
            }

            if (!specialtyId) {
                specialtyId = 1; // Medicina General
            }

            // 3. Obtener el ID real del Médico buscando en la API con la especialidad
            let doctorId = null;
            if (usuarioId) {
                try {
                    const docRes = await fetch(`http://localhost:8000/api/doctors/?specialty=${specialtyId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                        signal
                    });
                    if (docRes.ok) {
                        const medicos = await docRes.json();
                        const medicoEncontrado = (Array.isArray(medicos) ? medicos : []).find(m => {
                            const uId = m.usuario_id || m.user_id || (m.usuario && m.usuario.id) || m.user;
                            return Number(uId) === Number(usuarioId);
                        });

                        if (medicoEncontrado) {
                            doctorId = medicoEncontrado.id;
                        }
                    }
                } catch (errDocs) {
                    console.warn("No se pudo mapear el médico a través de la lista /api/doctors/", errDocs);
                }
            }

            // Fallback PostgreSQL Estático (por seguridad)
            if (!doctorId && usuarioId) {
                const mapeoEstatico = {
                    7: 1, // Lucía
                    9: 2  // Carlos
                };
                doctorId = mapeoEstatico[usuarioId];
            }

            if (!doctorId) {
                doctorId = 2;
            }

            // 4. EXTRAER LA SEDE (HEADQUARTERS) DE LA CITA ORIGINAL
            const headquartersId = citaSeleccionada.headquarters ||
                citaSeleccionada.headquarters_id ||
                citaSeleccionada.headquarter ||
                citaSeleccionada.headquarter_id;

            console.log("🕵️ Mapeo Final de Diagnóstico:", {
                citaOrigen: citaSeleccionada,
                usuarioIdLogueado: usuarioId,
                doctorIdResuelto: doctorId,
                specialtyIdResuelto: specialtyId,
                headquartersIdDetectado: headquartersId,
                fechaPeticion: fechaStr
            });

            // 5. CONSTRUIR URL DE SLOTS INCLUYENDO LA SEDE SI EXISTE
            let slotsUrl = `http://localhost:8000/api/availability/slots/?doctor=${doctorId}&specialty=${specialtyId}&date=${fechaStr}`;

            if (headquartersId) {
                slotsUrl += `&headquarters=${headquartersId}`;
            }

            const response = await fetch(slotsUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                signal
            });

            const data = await leerRespuesta(response);

            console.log("🚨 SLOTS CRUDOS DEL BACKEND:", data);

            if (!response.ok) {
                setErrorReprogramacion(data.detail || "No se pudieron obtener los horarios del médico.");
                return;
            }

            // EXTRACCIÓN DEL ARRAY:
            const listaDeSlots = Array.isArray(data)
                ? data
                : (data && Array.isArray(data.slots) ? data.slots : []);

            console.log("🛠️ Lista limpia de slots a renderizar:", listaDeSlots);

            const franjasMapeadas = listaDeSlots.map((slot, index) => {
                const fechaBase = slot.date || fechaStr;
                const inicio = new Date(`${fechaBase}T${slot.start_time}`);
                const fin = new Date(`${fechaBase}T${slot.end_time}`);

                return {
                    id: slot.id || `${fechaBase}-${index}`,
                    start: inicio,
                    end: fin,
                    title: `${inicio.toLocaleTimeString("es-CO", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false
                    })} - ${fin.toLocaleTimeString("es-CO", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false
                    })}`,
                };
            });

            setFranjasDisponibles(franjasMapeadas);
        } catch (err) {
            if (err.name !== "AbortError") {
                setErrorReprogramacion("Error de conexión al cargar la disponibilidad real del médico.");
            }
        } finally {
            setCargandoFranjas(false);
        }
    }, [citaSeleccionada, leerRespuesta]);

    useEffect(() => {
        cargarCitas().catch((err) => console.error("Error al cargar citas de forma inicial:", err));
    }, [cargarCitas]);

    useEffect(() => {
        const controller = new AbortController();

        if (modoReprogramacion && fechaReprogramacion && citaSeleccionada) {
            cargarDisponibilidadReal(fechaReprogramacion, controller.signal).catch((err) =>
                console.error("Error cargando disponibilidades reales:", err)
            );
        }

        return () => {
            controller.abort();
        };
    }, [modoReprogramacion, fechaReprogramacion, citaSeleccionada, cargarDisponibilidadReal]);

    const abrirAcciones = (cita, accion) => {
        setCitaSeleccionada(cita);
        setFechaReprogramacion(formatoInputFecha(fechaCita(cita)));
        setFranjaReprogramacion(null);
        setFranjasDisponibles([]);
        setErrorReprogramacion("");
        setConfirmacionReprogramacion("");
        setErrorCancelacion("");
        setConfirmacionCancelacion("");
        setMotivoCancelacion("");

        if (accion === "reprogramar") {
            setModoReprogramacion(true);
            setModoCancelacion(false);
            setTimeout(() => {
                reprogramacionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 0);
        } else if (accion === "cancelar") {
            setModoCancelacion(true);
            setModoReprogramacion(false);
            setTimeout(() => {
                cancelacionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 0);
        }
    };

    const puedeModificarCita = (cita) => {
        const estado = normalizar(cita?.status);
        return estado !== "cancelada" && estado !== "atendida" && estado !== "completada";
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
                `http://localhost:8000/api/appointments/${citaSeleccionada.id}/reschedule/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        scheduled_at: formatoDateTimeLocal(franjaReprogramacion.start),
                        reason: "Reprogramacion realizada por el profesional de la salud",
                    }),
                }
            );

            const data = await leerRespuesta(response);

            if (!response.ok) {
                setErrorReprogramacion(obtenerMensajeError(data, "No se pudo reprogramar la cita."));
                return;
            }

            setConfirmacionReprogramacion("Cita reprogramada correctamente.");
            setModoReprogramacion(false);
            setFranjaReprogramacion(null);
            await cargarCitas();

            setTimeout(() => setConfirmacionReprogramacion(""), 5000);
        } catch {
            setErrorReprogramacion("Error de conexión al reprogramar la cita.");
        } finally {
            setCargando(false);
        }
    };

    const confirmarCancelacion = async () => {
        if (!motivoCancelacion.trim()) {
            setErrorCancelacion("El motivo de cancelación es obligatorio.");
            return;
        }

        setCargando(true);
        setErrorCancelacion("");
        setConfirmacionCancelacion("");

        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(
                `http://localhost:8000/api/appointments/${citaSeleccionada.id}/doctor-cancel/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        reason: motivoCancelacion.trim(),
                    }),
                }
            );

            const data = await leerRespuesta(response);

            if (!response.ok) {
                setErrorCancelacion(obtenerMensajeError(data, "No se pudo cancelar la cita."));
                return;
            }

            setConfirmacionCancelacion("Cita cancelada correctamente.");
            setMotivoCancelacion("");
            setModoCancelacion(false);
            await cargarCitas();

            setTimeout(() => setConfirmacionCancelacion(""), 5000);
        } catch {
            setErrorCancelacion("Error de conexión al cancelar la cita.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="admin-form-page animate-aparecer">
            <h2>Mi Agenda de Consultas</h2>
            <p>Consulta las citas asignadas a tu agenda médica, reprográmalas o cancélalas.</p>

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
            {confirmacionCancelacion && <p className="mensaje-exito">{confirmacionCancelacion}</p>}
            {confirmacionReprogramacion && <p className="mensaje-exito">{confirmacionReprogramacion}</p>}

            {!cargando && citas.length === 0 && !mensajeError && (
                <div className="appointments-empty">
                    <h3>No tienes citas asignadas</h3>
                    <p>Cuando se agenden citas contigo, aparecerán en esta tabla.</p>
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
                        <th>Duración</th>
                        <th>Estado</th>
                        <th>Acciones</th>
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
                            <td>
                                {puedeModificarCita(cita) ? (
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button
                                            type="button"
                                            className="enviar"
                                            onClick={() => abrirAcciones(cita, "reprogramar")}
                                            style={{ padding: "4px 10px", fontSize: "0.85rem" }}
                                        >
                                            Reprogramar
                                        </button>
                                        <button
                                            type="button"
                                            className="cancel-appointment-button"
                                            onClick={() => abrirAcciones(cita, "cancelar")}
                                            style={{ padding: "4px 10px", fontSize: "0.85rem" }}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                ) : (
                                    <span style={{ color: "#888", fontSize: "0.85rem", fontStyle: "italic" }}>
                                        Sin acciones
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {/* --- PANEL INTERACTIVO DE REPROGRAMACIÓN --- */}
            {modoReprogramacion && citaSeleccionada && (
                <div className="appointment-detail-panel animate-aparecer" ref={reprogramacionRef} style={{ marginTop: "30px" }}>
                    <h3>Reprogramar Cita de {citaSeleccionada.patient_name}</h3>
                    <p>Selecciona una nueva fecha y franja disponible para el paciente.</p>

                    <div className="reschedule-panel">
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

                        {errorReprogramacion && <p className="mensaje-error">{errorReprogramacion}</p>}
                        {cargandoFranjas && <p style={{ color: "grey", fontSize: "14px" }}>Cargando disponibilidad real del sistema...</p>}

                        {!cargandoFranjas && franjasDisponibles.length === 0 ? (
                            <div className="appointments-empty">
                                <h3>No hay horarios disponibles</h3>
                                <p>Prueba seleccionando una fecha diferente en el selector superior.</p>
                            </div>
                        ) : (
                            !cargandoFranjas && (
                                <div style={{ marginTop: "15px" }}>
                                    <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold", color: "#4b5563" }}>
                                        Selecciona un horario disponible:
                                    </label>
                                    <div className="reschedule-slots" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "15px" }}>
                                        {franjasDisponibles.map((franja) => (
                                            <button
                                                key={franja.id}
                                                type="button"
                                                className={`reschedule-slot ${franjaReprogramacion?.id === franja.id ? "selected" : ""}`}
                                                onClick={() => {
                                                    setFranjaReprogramacion(franja);
                                                    setErrorReprogramacion("");
                                                }}
                                            >
                                                {franja.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )
                        )}

                        {franjaReprogramacion && (
                            <div className="reschedule-confirmation" style={{ margin: "10px 0", padding: "10px", background: "#f0fdf4", borderRadius: "6px" }}>
                                <strong>Nuevo horario seleccionado:</strong>
                                <p>{new Date(franjaReprogramacion.start).toLocaleString("es-CO")}</p>
                            </div>
                        )}

                        <div className="reschedule-actions" style={{ display: "flex", gap: "10px" }}>
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
                            <button
                                type="button"
                                className="enviar"
                                onClick={confirmarReprogramacion}
                                disabled={!franjaReprogramacion || cargando}
                            >
                                {cargando ? "Confirmando..." : "Confirmar Cambio"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- PANEL INTERACTIVO DE CANCELACIÓN --- */}
            {modoCancelacion && citaSeleccionada && (
                <div className="appointment-detail-panel animate-aparecer" ref={cancelacionRef} style={{ marginTop: "30px" }}>
                    <h3>Confirmar Cancelación</h3>
                    <p>¿Estás seguro de que deseas cancelar la cita del siguiente paciente?</p>

                    <div className="cancel-confirmation-panel" style={{ background: "#fef2f2", padding: "15px", borderRadius: "8px", border: "1px solid #fee2e2" }}>
                        <div className="cancel-summary" style={{ marginBottom: "15px" }}>
                            <strong>Paciente: {citaSeleccionada.patient_name}</strong>
                            <p>Fecha asignada: {new Date(citaSeleccionada.scheduled_at).toLocaleString("es-CO")}</p>
                            <p>Especialidad: {citaSeleccionada.specialty_name}</p>
                        </div>

                        <div style={{ marginBottom: "15px", textAlign: "left" }}>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold", color: "#991b1b" }}>
                                Motivo de la cancelación (Obligatorio)
                            </label>
                            <textarea
                                value={motivoCancelacion}
                                onChange={(e) => {
                                    setMotivoCancelacion(e.target.value);
                                    setErrorCancelacion("");
                                }}
                                placeholder="Escribe el motivo detallado por el cual se cancela esta cita..."
                                rows={3}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "6px",
                                    border: "1px solid #f87171",
                                    fontSize: "0.9rem",
                                    boxSizing: "border-box"
                                }}
                            />
                        </div>

                        {errorCancelacion && <p className="mensaje-error" style={{ color: "#dc2626", fontWeight: "bold", marginBottom: "10px" }}>{errorCancelacion}</p>}

                        <div className="reschedule-actions" style={{ display: "flex", gap: "10px" }}>
                            <button
                                type="button"
                                className="cambiar_horario"
                                onClick={() => {
                                    setModoCancelacion(false);
                                    setErrorCancelacion("");
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="cancel-appointment-button"
                                onClick={confirmarCancelacion}
                                disabled={cargando}
                                style={{ padding: "10px 20px" }}
                            >
                                {cargando ? "Cancelando..." : "Confirmar Cancelación"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CitasMedico;
