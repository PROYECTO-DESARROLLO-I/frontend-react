import { useState, useEffect } from "react";
import "./App.css";

function AdminReportes() {
    const [filtros, setFiltros] = useState({
        fechaDesde: "",
        fechaHasta: "",
        medico: "",
        especialidad: "", // Guardará el ID numérico
        estado: "",
        paciente: ""
    });

    const [citas, setCitas] = useState([]);
    const [especialidades, setEspecialidades] = useState([]); // Almacena especialidades de la BD
    const [kpis, setKpis] = useState({ citasDelDia: 0, tasaCancelacion: 0, ocupacion: 0 });
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFiltros({ ...filtros, [name]: value });
    };

    const construirQueryParams = () => {
        const params = new URLSearchParams();
        if (filtros.fechaDesde) params.append("date_from", filtros.fechaDesde);
        if (filtros.fechaHasta) params.append("date_to", filtros.fechaHasta);
        if (filtros.medico) params.append("doctor_name", filtros.medico);
        if (filtros.especialidad) params.append("specialty", filtros.especialidad); // Enviará el ID
        if (filtros.estado) params.append("status", filtros.estado.toLowerCase());
        if (filtros.paciente) params.append("patient_name", filtros.paciente);
        return params.toString();
    };

    // Función para cargar especialidades desde el backend
    const cargarEspecialidades = async () => {
        const token = localStorage.getItem("accessToken");
        try {
            // Ajusta esta URL según la ruta de especialidades de tu backend (ej. /api/specialties/ o /api/appointments/specialties/)
            const res = await fetch("http://localhost:8000/api/specialties/", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Suponiendo que el backend retorna un arreglo directo o un objeto con results
                const lista = Array.isArray(data) ? data : (data.results || []);
                setEspecialidades(lista);
            }
        } catch (err) {
            console.error("Error al cargar especialidades para el filtro:", err);
        }
    };

    const consultarDatos = async () => {
        setCargando(true);
        setError("");
        const token = localStorage.getItem("accessToken");

        try {
            // 1. Obtener KPIs del dashboard
            const kpiRes = await fetch("http://localhost:8000/api/dashboard/kpis/", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (kpiRes.ok) {
                const kpiData = await kpiRes.json();
                setKpis({
                    citasDelDia: kpiData.total_today,
                    tasaCancelacion: kpiData.cancellation_rate_percent,
                    ocupacion: kpiData.occupation_by_doctor.length > 0 ? 85.0 : 0
                });
            }

            // 2. Obtener citas filtradas
            const queryParams = construirQueryParams();
            const appointmentsRes = await fetch(`http://localhost:8000/api/dashboard/appointments/?${queryParams}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!appointmentsRes.ok) {
                setError("No se pudo conectar con el servidor de reportes.");
                setCargando(false);
                return;
            }

            const appointmentsData = await appointmentsRes.json();

            const citasMapeadas = appointmentsData.results.map((cita) => ({
                id: cita.id,
                fecha_hora: new Date(cita.scheduled_at).toLocaleString("es-CO"),
                paciente_nombre: cita.patient_name,
                paciente_documento: cita.patient_document || "Sin documento",
                medico_nombre: `Dr(a). ${cita.doctor_name}`,
                especialidad_nombre: cita.specialty_name,
                estado: cita.status.charAt(0).toUpperCase() + cita.status.slice(1)
            }));

            setCitas(citasMapeadas);
        } catch (err) {
            setError(err.message || "Error al procesar la solicitud.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        // Ejecutamos ambas consultas al montar el componente
        cargarEspecialidades().catch((err) => console.error(err));
        consultarDatos().catch((err) => {
            console.error("Error al inicializar los reportes:", err);
        });
    }, []);

    const handleExportarPDF = async () => {
        const token = localStorage.getItem("accessToken");
        const queryParams = construirQueryParams();

        try {
            const response = await fetch(`http://localhost:8000/api/dashboard/reports/export/?${queryParams}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) {
                alert("Error al descargar el PDF: No se pudo generar el reporte PDF.");
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `reporte_citas_${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            alert("Error al descargar el PDF: " + err.message);
        }
    };

    return (
        <div className="admin-reportes-container">
            <section className="filtros-card">
                <h3>Búsqueda y Filtrado Avanzado</h3>
                <div className="filtros-grid">
                    <input type="date" name="fechaDesde" value={filtros.fechaDesde} onChange={handleInputChange} />
                    <input type="date" name="fechaHasta" value={filtros.fechaHasta} onChange={handleInputChange} />
                    <input type="text" name="medico" value={filtros.medico} onChange={handleInputChange} placeholder="Nombre Médico" />

                    {/* SELECTOR DINÁMICO DE ESPECIALIDADES */}
                    <select name="especialidad" value={filtros.especialidad} onChange={handleInputChange}>
                        <option value="">Todas las especialidades</option>
                        {especialidades.map((esp) => (
                            <option key={esp.id} value={esp.id}>
                                {esp.name}
                            </option>
                        ))}
                    </select>

                    <input type="text" name="paciente" value={filtros.paciente} onChange={handleInputChange} placeholder="Nombre Paciente" />
                    <select name="estado" value={filtros.estado} onChange={handleInputChange}>
                        <option value="">Todos los estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="atendida">Atendida</option>
                        <option value="cancelada">Cancelada</option>
                    </select>
                </div>
                <div className="filtros-acciones">
                    <button onClick={consultarDatos} className="btn-filtrar">Aplicar Filtros</button>
                    <button onClick={handleExportarPDF} className="btn-exportar">Exportar Reporte (PDF)</button>
                </div>
            </section>

            <section className="reportes-kpi-grid">
                <div className="reportes-card-kpi" style={{ borderColor: "#DE300D" }}>
                    <span>Citas del Día</span>
                    <strong>{kpis.citasDelDia}</strong>
                    <p>Monitoreo en tiempo real</p>
                </div>
                <div className="reportes-card-kpi" style={{ borderColor: "#DE300D" }}>
                    <span>Tasa de Cancelación</span>
                    <strong>{kpis.tasaCancelacion}%</strong>
                    <p>Frente a citas realizadas</p>
                </div>
                <div className="reportes-card-kpi" style={{ borderColor: "#DE300D" }}>
                    <span>Ocupación de Agenda</span>
                    <strong>{kpis.ocupacion}%</strong>
                    <p>Promedio por médico</p>
                </div>
            </section>

            <section className="resultados-card">
                <h3>Resultados del Reporte</h3>
                {cargando && <p style={{ color: "grey", fontStyle: "oblique", textAlign: "center" }}>Cargando información estadística...</p>}
                {error && <p className="mensaje-error">{error}</p>}
                {!cargando && citas.length === 0 && <p style={{ textAlign: "center", color: "grey" }}>No se encontraron citas con los filtros seleccionados.</p>}

                {!cargando && citas.length > 0 && (
                    <table className="reportes-tabla">
                        <thead>
                        <tr>
                            <th>Fecha/Hora</th>
                            <th>Paciente</th>
                            <th>Médico</th>
                            <th>Especialidad</th>
                            <th>Estado</th>
                        </tr>
                        </thead>
                        <tbody>
                        {citas.map((cita) => {
                            let claseEstado = "status-programada";
                            const est = cita.estado.toLowerCase();
                            if (est === "atendida" || est === "realizada") claseEstado = "status-realizada";
                            if (est === "cancelada") claseEstado = "status-cancelada";
                            if (est === "pendiente") claseEstado = "status-incumplida";

                            return (
                                <tr key={cita.id}>
                                    <td>{cita.fecha_hora}</td>
                                    <td>{cita.paciente_nombre} ({cita.paciente_documento})</td>
                                    <td>{cita.medico_nombre}</td>
                                    <td>{cita.especialidad_nombre}</td>
                                    <td><span className={`badge ${claseEstado}`}>{cita.estado}</span></td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}

export default AdminReportes;