import { useState, useEffect } from "react";
import "./App.css";

function AdminReportes() {
    const [filtros, setFiltros] = useState({
        fechaDesde: "",
        fechaHasta: "",
        medico: "",
        especialidad: "",
        estado: "",
        paciente: ""
    });

    const [citas, setCitas] = useState([]);
    const [kpis, setKpis] = useState({ citasDelDia: 0, tasaCancelacion: 0, ocupacion: 0});
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFiltros({ ...filtros, [name]: value });
    };

    const consultarDatos = () => {
        setCargando(true);
        setError("");

        setTimeout(() => {
            try {
                const citasPrueba = [
                    {
                        id: 1,
                        fecha_hora: "2026-07-07 08:30",
                        paciente_nombre: "David Taborda",
                        paciente_documento: "1105362766",
                        medico_nombre: "Dr(a). Lucía Hernández",
                        especialidad_nombre: "Medicina General",
                        estado: "Realizada"
                    },
                    {
                        id: 2,
                        fecha_hora: "2026-07-07 09:15",
                        paciente_nombre: "Daniel Tovar",
                        paciente_documento: "1105362736",
                        medico_nombre: "Dr(a). Carlos Pérez",
                        especialidad_nombre: "Medicina General",
                        estado: "Programada"
                    },
                    {
                        id: 3,
                        fecha_hora: "2026-07-05 14:00",
                        paciente_nombre: "María Clemencia",
                        paciente_documento: "31444555",
                        medico_nombre: "Dr(a). Lucía Hernández",
                        especialidad_nombre: "Medicina General",
                        estado: "Cancelada"
                    },
                    {
                        id: 4,
                        fecha_hora: "2026-07-04 11:00",
                        paciente_nombre: "Carlos Restrepo",
                        paciente_documento: "16777888",
                        medico_nombre: "Dr(a). Andrés Mendoza",
                        especialidad_nombre: "Pediatría",
                        estado: "Incumplida"
                    }
                ];

                let citasFiltradas = [...citasPrueba];

                if (filtros.paciente) {
                    citasFiltradas = citasFiltradas.filter(c => c.paciente_documento.includes(filtros.paciente) ||
                    c.paciente_nombre.toLowerCase().includes(filtros.paciente.toLowerCase()));
                }
                if (filtros.estado) {
                    citasFiltradas = citasFiltradas.filter(c => c.estado.toLowerCase() === filtros.estado.toLowerCase());
                }
                if (filtros.especialidad) {
                    citasFiltradas = citasFiltradas.filter(c => c.especialidad_nombre.toLowerCase().includes(filtros.especialidad.toLowerCase()));
                }
                if (filtros.medico) {
                    citasFiltradas = citasFiltradas.filter(c => c.medico_nombre.toLowerCase().includes(filtros.medico.toLowerCase()));
                }

                const totales = citasFiltradas.length;
                const canceladas = citasFiltradas.filter(c => c.estado === "Cancelada").length;
                const tasaCancelacion = totales > 0 ? ((canceladas / totales) * 100).toFixed(1) : 0;

                setCitas(citasFiltradas);
                setKpis({ citasDelDia: totales, tasaCancelacion: tasaCancelacion, ocupacion: totales > 0 ? 78.5 : 0 });
            } catch (err) {
                setError("Error interno al procesar los filtros.");
            } finally {
                setCargando(false);
            }
        }, 800);
    };

    useEffect(() => {
        consultarDatos();
    }, []);

    const handleExportarPDF = () => {
        window.print();
    };

    return (
        <div className="admin-reportes-container">
            <section className="filtros-card">
                <h3>Búsqueda y Filtrado Avanzado</h3>
                <div className="filtros-grid">
                    <input type="date" name="fechaDesde" value={filtros.fechaDesde} onChange={handleInputChange} placeholder="Desde" />
                    <input type="date" name="fechaHasta" value={filtros.fechaHasta} onChange={handleInputChange} placeholder="Hasta" />
                    <input type="text" name="medico" value={filtros.medico} onChange={handleInputChange} placeholder="Nombre o ID Médico" />
                    <input type="text" name="especialidad" value={filtros.especialidad} onChange={handleInputChange} placeholder="Especialidad Médica" />
                    <input type="text" name="paciente" value={filtros.paciente} onChange={handleInputChange} placeholder="Documento o Nombre Paciente" />
                    <select name="estado" value={filtros.estado} onChange={handleInputChange}>
                        <option value="">Todos los estados</option>
                        <option value="Programada">Programada</option>
                        <option value="Realizada">Realizada</option>
                        <option value="Cancelada">Cancelada</option>
                        <option value="Incumplida">Incumplida</option>
                    </select>
                </div>
                <div className="filtros-acciones">
                    <button onClick={consultarDatos} className="btn-filtrar">Aplicar Filtros</button>
                    <button onClick={handleExportarPDF} className="btn-exportar">Exportar Reporte (PDF)</button>
                </div>
            </section>

            <section className="reportes-kpi-grid">
                <div className="reportes-card-kpi">
                    <span>Citas del Día</span>
                    <strong>{kpis.citasDelDia}</strong>
                    <p>Monitoreo en tiempo real</p>
                </div>
                <div className="reportes-card-kpi">
                    <span>Tasa de Cancelación</span>
                    <strong>{kpis.tasaCancelacion}%</strong>
                    <p>Frente a citas realizadas</p>
                </div>
                <div className="reportes-card-kpi">
                    <span>Ocupación de Agenda</span>
                    <strong>{kpis.ocupacion}%</strong>
                    <p>Promedio por médico / sede</p>
                </div>
            </section>

            <section className="resultados-card">
                <h3>Resultados del Reporte</h3>
                {cargando && <p>Cargando información estadística...</p>}
                {error && <p className="error-msg">{error}</p>}
                {!cargando && citas.length === 0 && <p>No se encontraron citas con los filtros seleccionados.</p>}

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
                        {citas.map((cita) => (
                            <tr key={cita.id}>
                                <td>{cita.fecha_hora}</td>
                                <td>{cita.paciente_nombre} ({cita.paciente_documento})</td>
                                <td>{cita.medico_nombre}</td>
                                <td>{cita.especialidad_nombre}</td>
                                <td><span className={`badge status-${cita.estado.toLowerCase()}`}>{cita.estado}</span></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
}

export default AdminReportes;