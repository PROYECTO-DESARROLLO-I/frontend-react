import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
// Importamos los componentes de Recharts para armar las gráficas profesionales
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts";

const API_BASE = "http://localhost:8000/api";

const fechaISO = (date) => date.toISOString().slice(0, 10);

const sumarDias = (date, dias) => {
  const copia = new Date(date);
  copia.setDate(copia.getDate() + dias);
  return copia;
};

// Colores profesionales para el Dashboard (paleta amigable para salud)
const COLORES_ESTADOS = {
  Confirmada: "#4caf50",   // Verde
  Pendiente: "#ff9800",    // Naranja
  Atendida: "#2196f3",     // Azul
  Cancelada: "#f44336",    // Rojo
  Reprogramada: "#9c27b0", // Morado
};

function AdminReportes() {
  const [filtros, setFiltros] = useState({
    fechaDesde: "",
    fechaHasta: "",
    medico: "",
    especialidad: "",
    estado: "",
    paciente: "",
  });

  const [citas, setCitas] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [estadisticasEspecialidad, setEstadisticasEspecialidad] = useState([]);
  const [recordatorios, setRecordatorios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensajeSistema, setMensajeSistema] = useState({ texto: "", tipo: "" });

  const authHeaders = useMemo(
      () => ({
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      }),
      [],
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFiltros((actual) => ({ ...actual, [name]: value }));
  };

  const construirQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    if (filtros.fechaDesde) params.append("date_from", filtros.fechaDesde);
    if (filtros.fechaHasta) params.append("date_to", filtros.fechaHasta);
    if (filtros.medico) params.append("doctor_name", filtros.medico);
    if (filtros.especialidad) params.append("specialty", filtros.especialidad);
    if (filtros.estado) params.append("status", filtros.estado.toLowerCase());
    if (filtros.paciente) params.append("patient_name", filtros.paciente);
    return params.toString();
  }, [filtros]);

  const cargarEspecialidades = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard/specialties/`, { headers: authHeaders });
      if (!response.ok) return;

      const data = await response.json();
      setEspecialidades(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Error al cargar especialidades para el filtro:", err);
    }
  }, [authHeaders]);

  const cargarKpis = useCallback(async () => {
    const response = await fetch(`${API_BASE}/dashboard/kpis/`, { headers: authHeaders });
    if (!response.ok) throw new Error("No se pudieron cargar los KPIs del dashboard.");

    const data = await response.json();
    setKpis(data);
  }, [authHeaders]);

  const cargarEstadisticasEspecialidad = useCallback(async () => {
    const params = new URLSearchParams();
    if (filtros.fechaDesde) params.append("date_from", filtros.fechaDesde);
    if (filtros.fechaHasta) params.append("date_to", filtros.fechaHasta);

    const response = await fetch(`${API_BASE}/dashboard/specialties/stats/?${params.toString()}`, {
      headers: authHeaders,
    });
    if (!response.ok) throw new Error("No se pudieron cargar las estadisticas por especialidad.");

    const data = await response.json();
    setEstadisticasEspecialidad(data.results || []);
  }, [authHeaders, filtros.fechaDesde, filtros.fechaHasta]);

  const cargarRecordatorios = useCallback(async () => {
    const hoy = new Date();
    const params = new URLSearchParams({
      date_from: fechaISO(hoy),
      date_to: fechaISO(sumarDias(hoy, 7)),
      page_size: "100",
    });

    const response = await fetch(`${API_BASE}/dashboard/appointments/?${params.toString()}`, {
      headers: authHeaders,
    });
    if (!response.ok) throw new Error("No se pudieron cargar los recordatorios.");

    const data = await response.json();
    const proximas = (data.results || [])
        .filter((cita) => ["confirmada", "pendiente", "reprogramada"].includes(cita.status))
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
        .slice(0, 8);

    setRecordatorios(proximas);
  }, [authHeaders]);

  const consultarDatos = useCallback(async () => {
    setCargando(true);
    setMensajeSistema({ texto: "", tipo: "" });

    try {
      const queryParams = construirQueryParams();
      const appointmentsRes = await fetch(`${API_BASE}/dashboard/appointments/?${queryParams}`, {
        headers: authHeaders,
      });

      if (!appointmentsRes.ok) {
        setMensajeSistema({ texto: "No se pudo conectar con el servidor de reportes.", tipo: "error" });
        return;
      }

      const appointmentsData = await appointmentsRes.json();
      const citasMapeadas = (appointmentsData.results || []).map((cita) => ({
        id: cita.id,
        fecha_hora: new Date(cita.scheduled_at).toLocaleString("es-CO"),
        paciente_nombre: cita.patient_name || "Sin nombre",
        paciente_documento: cita.patient_document || "Sin documento",
        medico_nombre: `Dr(a). ${cita.doctor_name}`,
        especialidad_nombre: cita.specialty_name,
        sede_nombre: cita.headquarters_name || "Sin sede",
        estado: cita.status.charAt(0).toUpperCase() + cita.status.slice(1),
      }));

      setCitas(citasMapeadas);
      await Promise.all([cargarKpis(), cargarEstadisticasEspecialidad(), cargarRecordatorios()]);
    } catch (err) {
      setMensajeSistema({ texto: "Error al procesar la solicitud.", tipo: "error" });
    } finally {
      setCargando(false);
    }
  }, [authHeaders, cargarEstadisticasEspecialidad, cargarKpis, cargarRecordatorios, construirQueryParams]);

  useEffect(() => {
    cargarEspecialidades().catch((err) => console.error(err));
    consultarDatos().catch((err) => console.error("Error al inicializar los reportes:", err));
  }, [cargarEspecialidades, consultarDatos]);

  // Formateamos los datos de estados para que Recharts los entienda sin problemas
  const datosGraficaEstados = useMemo(() => {
    const estados = kpis?.by_status || {};
    return [
      { name: "Confirmada", value: estados.confirmed || 0 },
      { name: "Pendiente", value: estados.pending || 0 },
      { name: "Atendida", value: estados.attended || 0 },
      { name: "Cancelada", value: estados.cancelled || 0 },
      { name: "Reprogramada", value: estados.rescheduled || 0 },
    ].filter(item => item.value > 0); // Solo mostramos los que tengan datos para no saturar la dona
  }, [kpis]);

  const datosOcupacionMedicos = useMemo(() => {
    return (kpis?.occupation_by_doctor || []).map((item) => ({
      name: item.doctor_name.replace("Dr(a). ", ""),
      Citas: item.appointments_today,
    }));
  }, [kpis]);

  const datosEstadisticasEspecialidad = useMemo(() => {
    return estadisticasEspecialidad.map((item) => ({
      name: item.specialty_name || "Sin Nombre",
      Demanda: item.total,
      Utilizacion: item.utilization_rate,
    }));
  }, [estadisticasEspecialidad]);

  const handleExportarPDF = async () => {
    const queryParams = construirQueryParams();
    setMensajeSistema({ texto: "Generando PDF...", tipo: "exito" });

    try {
      const response = await fetch(`${API_BASE}/dashboard/reports/export/?${queryParams}`, {
        headers: authHeaders,
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
      setMensajeSistema({ texto: "PDF descargado con éxito.", tipo: "exito" });
    } catch (err) {
      alert(`Error al descargar el PDF: ${err.message}`);
    }
  };

  return (
      <div className="admin-reportes-container">
        <section className="filtros-card">
          <h3>Busqueda y filtrado avanzado</h3>
          <div className="filtros-grid">
            <input type="date" name="fechaDesde" value={filtros.fechaDesde} onChange={handleInputChange} />
            <input type="date" name="fechaHasta" value={filtros.fechaHasta} onChange={handleInputChange} />
            <input type="text" name="medico" value={filtros.medico} onChange={handleInputChange} placeholder="Nombre medico" />

            <select name="especialidad" value={filtros.especialidad} onChange={handleInputChange}>
              <option value="">Todas las especialidades</option>
              {especialidades.map((esp) => (
                  <option key={esp.id} value={esp.id}>
                    {esp.name}
                  </option>
              ))}
            </select>

            <input type="text" name="paciente" value={filtros.paciente} onChange={handleInputChange} placeholder="Nombre paciente" />
            <select name="estado" value={filtros.estado} onChange={handleInputChange}>
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="atendida">Atendida</option>
              <option value="cancelada">Cancelada</option>
              <option value="reprogramada">Reprogramada</option>
            </select>
          </div>
          <div className="filtros-acciones">
            <button onClick={consultarDatos} className="btn-filtrar" disabled={cargando}>
              {cargando ? "Cargando..." : "Aplicar filtros"}
            </button>
            <button onClick={handleExportarPDF} className="btn-exportar" disabled={cargando}>Exportar reporte PDF</button>
          </div>

          {mensajeSistema.texto && (
              <p className={mensajeSistema.tipo === "exito" ? "mensaje-exito" : "mensaje-error-box"} style={{ marginTop: "15px" }}>
                {mensajeSistema.texto}
              </p>
          )}
        </section>

        <section className="reportes-grafica-card">
          <h3>Operacion del dia {kpis?.date ? `(${kpis.date})` : ""}</h3>
          <div className="dashboard-kpi-grid">
            <div className="dashboard-kpi-item">
              <span>Citas de hoy</span>
              <strong>{kpis?.total_today ?? 0}</strong>
            </div>
            <div className="dashboard-kpi-item">
              <span>Confirmadas</span>
              <strong>{kpis?.by_status?.confirmed ?? 0}</strong>
            </div>
            <div className="dashboard-kpi-item">
              <span>Pendientes</span>
              <strong>{kpis?.by_status?.pending ?? 0}</strong>
            </div>
            <div className="dashboard-kpi-item">
              <span>Atendidas</span>
              <strong>{kpis?.by_status?.attended ?? 0}</strong>
            </div>
            <div className="dashboard-kpi-item">
              <span>Canceladas</span>
              <strong>{kpis?.by_status?.cancelled ?? 0}</strong>
            </div>
            <div className="dashboard-kpi-item">
              <span>Tasa de cancelacion</span>
              <strong>{kpis?.cancellation_rate_percent ?? 0}%</strong>
            </div>
          </div>
        </section>

        {/* GRÁFICA 1: TENDENCIAS Y DISTRIBUCIÓN DE CITAS (Gráfico de Dona Interactivo) */}
        <section className="reportes-grafica-card">
          <h3>Distribución y tendencia de estados de citas</h3>
          <p style={{ color: "grey", fontSize: "0.9rem", marginBottom: "15px" }}>Proporción real de citas agendadas.</p>
          {datosGraficaEstados.length === 0 ? (
              <p style={{ textAlign: "center", color: "grey", padding: "20px" }}>No hay registros de citas para graficar hoy.</p>
          ) : (
              <div style={{ width: "100%", height: 320, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                        data={datosGraficaEstados}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                    >
                      {datosGraficaEstados.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={COLORES_ESTADOS[entry.name] || "#8884d8"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Citas`, "Cantidad"]} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
          )}
        </section>

        {/* GRÁFICA 2: OCUPACIÓN POR MÉDICO (Gráfico de Barras Profesionales) */}
        <section className="reportes-grafica-card">
          <h3>Ocupación por médico</h3>
          <p style={{ color: "grey", fontSize: "0.9rem", marginBottom: "15px" }}>Citas activas asignadas para hoy por profesional médico.</p>

          {datosOcupacionMedicos.length === 0 ? (
              <p style={{ textAlign: "center", color: "grey", padding: "20px" }}>No hay ocupación registrada para hoy.</p>
          ) : (
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosOcupacionMedicos} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={100} style={{ fontSize: "0.85rem" }} />
                    <Tooltip cursor={{ fill: "#f5f5f5" }} />
                    <Bar dataKey="Citas" fill="#2196f3" radius={[0, 5, 5, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
          )}
        </section>

        {/* GRÁFICA 3: USO POR ESPECIALIDAD (Gráfico de Áreas de Tendencia de Demanda) */}
        <section className="reportes-grafica-card">
          <h3>Tendencia de uso por especialidad</h3>
          <p style={{ color: "grey", fontSize: "0.9rem", marginBottom: "15px" }}>Volumen de demanda del servicio en el rango de fechas seleccionado.</p>

          {datosEstadisticasEspecialidad.length === 0 ? (
              <p style={{ textAlign: "center", color: "grey", padding: "20px" }}>No hay datos de especialidades para el periodo.</p>
          ) : (
              <div style={{ width: "100%", height: 300, marginBottom: "25px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={datosEstadisticasEspecialidad} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDemanda" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" style={{ fontSize: "0.85rem" }} />
                    <YAxis label={{ value: 'Citas', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="Demanda" stroke="#82ca9d" fillOpacity={1} fill="url(#colorDemanda)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
          )}

          <table className="reportes-tabla">
            <thead>
            <tr>
              <th>Especialidad</th>
              <th>Total</th>
              <th>Confirmadas</th>
              <th>Pendientes</th>
              <th>Atendidas</th>
              <th>Canceladas</th>
              <th>Utilización</th>
            </tr>
            </thead>
            <tbody>
            {estadisticasEspecialidad.map((item) => (
                <tr key={item.specialty_id || item.specialty_name}>
                  <td>{item.specialty_name || "Sin especialidad"}</td>
                  <td>{item.total}</td>
                  <td>{item.confirmed}</td>
                  <td>{item.pending}</td>
                  <td>{item.attended}</td>
                  <td>{item.cancelled}</td>
                  <td>{item.utilization_rate}%</td>
                </tr>
            ))}
            </tbody>
          </table>
        </section>

        <section className="resultados-card">
          <h3>Resultados del reporte</h3>
          {cargando && <p style={{ color: "grey", fontStyle: "oblique", textAlign: "center" }}>Cargando información estadística...</p>}
          {!cargando && citas.length === 0 && <p style={{ textAlign: "center", color: "grey" }}>No se encontraron citas con los filtros seleccionados.</p>}

          {!cargando && citas.length > 0 && (
              <table className="reportes-tabla">
                <thead>
                <tr>
                  <th>Fecha/Hora</th>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Especialidad</th>
                  <th>Sede</th>
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
                        <td>{cita.sede_nombre}</td>
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