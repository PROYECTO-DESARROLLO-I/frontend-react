import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:8000/api";

const fechaISO = (date) => date.toISOString().slice(0, 10);

const sumarDias = (date, dias) => {
  const copia = new Date(date);
  copia.setDate(copia.getDate() + dias);
  return copia;
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
  const [error, setError] = useState("");

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
    setError("");

    try {
      const queryParams = construirQueryParams();
      const appointmentsRes = await fetch(`${API_BASE}/dashboard/appointments/?${queryParams}`, {
        headers: authHeaders,
      });

      if (!appointmentsRes.ok) {
        setError("No se pudo conectar con el servidor de reportes.");
        return;
      }

      const appointmentsData = await appointmentsRes.json();
      const citasMapeadas = (appointmentsData.results || []).map((cita) => ({
        id: cita.id,
        fecha_hora: new Date(cita.scheduled_at).toLocaleString("es-CO"),
        paciente_nombre: cita.patient_name,
        paciente_documento: cita.patient_document || "Sin documento",
        medico_nombre: `Dr(a). ${cita.doctor_name}`,
        especialidad_nombre: cita.specialty_name,
        sede_nombre: cita.headquarters_name || "Sin sede",
        estado: cita.status.charAt(0).toUpperCase() + cita.status.slice(1),
      }));

      setCitas(citasMapeadas);
      await Promise.all([cargarKpis(), cargarEstadisticasEspecialidad(), cargarRecordatorios()]);
    } catch (err) {
      setError(err.message || "Error al procesar la solicitud.");
    } finally {
      setCargando(false);
    }
  }, [authHeaders, cargarEstadisticasEspecialidad, cargarKpis, cargarRecordatorios, construirQueryParams]);

  useEffect(() => {
    cargarEspecialidades().catch((err) => console.error(err));
    consultarDatos().catch((err) => console.error("Error al inicializar los reportes:", err));
  }, [cargarEspecialidades, consultarDatos]);

  const graficaEstados = useMemo(() => {
    const estados = kpis?.by_status || {};
    const datos = [
      { estado: "Confirmada", total: estados.confirmed || 0 },
      { estado: "Pendiente", total: estados.pending || 0 },
      { estado: "Atendida", total: estados.attended || 0 },
      { estado: "Cancelada", total: estados.cancelled || 0 },
      { estado: "Reprogramada", total: estados.rescheduled || 0 },
    ];
    const maximo = Math.max(...datos.map((item) => item.total), 1);

    return datos.map((item) => ({
      ...item,
      porcentaje: Math.max((item.total / maximo) * 100, item.total > 0 ? 8 : 0),
    }));
  }, [kpis]);

  const ocupacionMedicos = useMemo(() => {
    const datos = kpis?.occupation_by_doctor || [];
    const maximo = Math.max(...datos.map((item) => item.appointments_today), 1);

    return datos.map((item) => ({
      ...item,
      porcentaje: Math.max((item.appointments_today / maximo) * 100, item.appointments_today > 0 ? 8 : 0),
    }));
  }, [kpis]);

  const estadisticasConPorcentaje = useMemo(() => {
    const maximo = Math.max(...estadisticasEspecialidad.map((item) => item.total), 1);

    return estadisticasEspecialidad.map((item) => ({
      ...item,
      porcentaje: Math.max((item.total / maximo) * 100, item.total > 0 ? 8 : 0),
    }));
  }, [estadisticasEspecialidad]);

  const handleExportarPDF = async () => {
    const queryParams = construirQueryParams();

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
          <button onClick={consultarDatos} className="btn-filtrar">Aplicar filtros</button>
          <button onClick={handleExportarPDF} className="btn-exportar">Exportar reporte PDF</button>
        </div>
      </section>

      {error && <p className="mensaje-error">{error}</p>}

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

      <section className="reportes-grafica-card">
        <h3>Distribucion de citas del dia</h3>
        

        <div className="reportes-bar-chart">
          {graficaEstados.map((item) => (
            <div className="reportes-bar-row" key={item.estado}>
              <span>{item.estado}</span>
              <div className="reportes-bar-track">
                <div
                  className={`reportes-bar-fill estado-${item.estado.toLowerCase()}`}
                  style={{ width: `${item.porcentaje}%` }}
                />
              </div>
              <strong>{item.total}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="reportes-grafica-card">
        <h3>Ocupacion por medico</h3>
        <p>Citas activas asignadas para hoy por profesional.</p>

        {ocupacionMedicos.length === 0 ? (
          <p>No hay ocupacion registrada para hoy.</p>
        ) : (
          <div className="reportes-bar-chart">
            {ocupacionMedicos.map((item) => (
              <div className="reportes-bar-row reportes-bar-row-wide" key={item.doctor_id}>
                <span>{item.doctor_name}</span>
                <div className="reportes-bar-track">
                  <div className="reportes-bar-fill" style={{ width: `${item.porcentaje}%` }} />
                </div>
                <strong>{item.appointments_today}</strong>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="reportes-grafica-card">
        <h3>Uso por especialidad</h3>
        <p>Demanda y utilizacion en el rango de fechas seleccionado.</p>

        {estadisticasConPorcentaje.length === 0 ? (
          <p>No hay datos de especialidades para el periodo.</p>
        ) : (
          <div className="reportes-bar-chart">
            {estadisticasConPorcentaje.map((item) => (
              <div className="reportes-bar-row reportes-bar-row-wide" key={item.specialty_id || item.specialty_name}>
                <span>{item.specialty_name || "Sin especialidad"}</span>
                <div className="reportes-bar-track">
                  <div className="reportes-bar-fill" style={{ width: `${item.porcentaje}%` }} />
                </div>
                <strong>{item.total}</strong>
              </div>
            ))}
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
              <th>Utilizacion</th>
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
        {cargando && <p style={{ color: "grey", fontStyle: "oblique", textAlign: "center" }}>Cargando informacion estadistica...</p>}
        {!cargando && citas.length === 0 && <p style={{ textAlign: "center", color: "grey" }}>No se encontraron citas con los filtros seleccionados.</p>}

        {!cargando && citas.length > 0 && (
          <table className="reportes-tabla">
            <thead>
              <tr>
                <th>Fecha/Hora</th>
                <th>Paciente</th>
                <th>Medico</th>
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
