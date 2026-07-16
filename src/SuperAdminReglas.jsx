import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:8000/api";

const limiteInicial = {
  eps: "",
  specialty: "",
  period: "mensual",
  max_appointments: "",
  active: true,
};

const presupuestoInicial = {
  eps: "",
  specialty: "",
  period_start: "",
  period_end: "",
  total_budget: "",
};

const frecuenciaInicial = {
  specialty: "",
  period: "mensual",
  max_appointments_per_patient: "",
};

function SuperAdminReglas() {
  const [eps, setEps] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [limites, setLimites] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [frecuencias, setFrecuencias] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [limiteForm, setLimiteForm] = useState(limiteInicial);
  const [presupuestoForm, setPresupuestoForm] = useState(presupuestoInicial);
  const [frecuenciaForm, setFrecuenciaForm] = useState(frecuenciaInicial);
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [cargando, setCargando] = useState(false);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    }),
    [],
  );

  const leerRespuesta = async (response) => {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { detail: text };
    }
  };

  const mensajeDeError = (data, respaldo) => {
    if (data?.detail) return data.detail;
    if (data?.non_field_errors?.length) return data.non_field_errors[0];
    const primerError = Object.values(data || {})[0];
    if (Array.isArray(primerError)) return primerError[0];
    if (typeof primerError === "string") return primerError;
    return respaldo;
  };

  const normalizarLista = (data) => (Array.isArray(data) ? data : data.results || []);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setMensajeError("");

    try {
      const respuestas = await Promise.all([
        fetch(`${API_BASE}/eps/`, { headers }),
        fetch(`${API_BASE}/specialties/admin/`, { headers }),
        fetch(`${API_BASE}/rules/limits/`, { headers }),
        fetch(`${API_BASE}/rules/budgets/`, { headers }),
        fetch(`${API_BASE}/rules/frequency/`, { headers }),
        fetch(`${API_BASE}/rules/alerts/`, { headers }),
      ]);
      const datos = await Promise.all(respuestas.map((response) => leerRespuesta(response)));

      const respuestaConError = respuestas.find((response) => !response.ok);
      if (respuestaConError) {
        const indice = respuestas.indexOf(respuestaConError);
        setMensajeError(mensajeDeError(datos[indice], "No se pudieron cargar las reglas de negocio."));
        return;
      }

      setEps(normalizarLista(datos[0]));
      setEspecialidades(normalizarLista(datos[1]));
      setLimites(normalizarLista(datos[2]));
      setPresupuestos(normalizarLista(datos[3]));
      setFrecuencias(normalizarLista(datos[4]));
      setAlertas(datos[5]?.alerts || []);
    } catch {
      setMensajeError("Error de conexion al cargar reglas de negocio.");
    } finally {
      setCargando(false);
    }
  }, [headers]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const manejarCambio = (setter) => (e) => {
    const { name, value, type, checked } = e.target;
    setter((actual) => ({
      ...actual,
      [name]: type === "checkbox" ? checked : value,
    }));
    setMensajeError("");
    setMensajeExito("");
  };

  const crearRegistro = async (e, endpoint, form, limpiar, mensaje) => {
    e.preventDefault();
    setMensajeError("");
    setMensajeExito("");

    const body = {
      ...form,
      eps: form.eps ? Number(form.eps) : undefined,
      specialty: form.specialty ? Number(form.specialty) : null,
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      const data = await leerRespuesta(response);

      if (!response.ok) {
        setMensajeError(mensajeDeError(data, "No se pudo guardar la regla."));
        return;
      }

      limpiar();
      setMensajeExito(mensaje);
      await cargarDatos();
    } catch {
      setMensajeError("Error de conexion al guardar la regla.");
    }
  };

  const eliminarRegistro = async (endpoint, id, mensaje) => {
    setMensajeError("");
    setMensajeExito("");

    try {
      const response = await fetch(`${API_BASE}${endpoint}${id}/`, {
        method: "DELETE",
        headers,
      });
      const data = await leerRespuesta(response);

      if (!response.ok) {
        setMensajeError(mensajeDeError(data, "No se pudo eliminar la regla."));
        return;
      }

      setMensajeExito(mensaje);
      await cargarDatos();
    } catch {
      setMensajeError("Error de conexion al eliminar la regla.");
    }
  };

  const renderSelectEPS = (value, onChange) => (
    <select name="eps" value={value} onChange={onChange} required>
      <option value="">-- Seleccione EPS --</option>
      {eps.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  );

  const renderSelectEspecialidad = (value, onChange) => (
    <select name="specialty" value={value} onChange={onChange}>
      <option value="">Todas las especialidades</option>
      {especialidades.map((especialidad) => (
        <option key={especialidad.id} value={especialidad.id}>
          {especialidad.name}
        </option>
      ))}
    </select>
  );

  return (
    <div className="admin-form-page">
      <div className="admin-form-card">
        <h2>Reglas de negocio</h2>
        <p>Configura topes, presupuestos, frecuencia de citas y alertas del sistema.</p>

        {mensajeError && <p className="mensaje-error">{mensajeError}</p>}
        {mensajeExito && <p className="mensaje-exito">{mensajeExito}</p>}
        {cargando && <p>Cargando reglas...</p>}
      </div>

      <div className="admin-form-card" style={{ marginTop: "22px" }}>
        <h2>Topes de citas por EPS</h2>
        <form
          className="admin-form-grid"
          onSubmit={(e) =>
            crearRegistro(e, "/rules/limits/", limiteForm, () => setLimiteForm(limiteInicial), "Tope creado correctamente.")
          }
        >
          <label>EPS</label>
          {renderSelectEPS(limiteForm.eps, manejarCambio(setLimiteForm))}

          <label>Especialidad</label>
          {renderSelectEspecialidad(limiteForm.specialty, manejarCambio(setLimiteForm))}

          <label>Periodo</label>
          <select name="period" value={limiteForm.period} onChange={manejarCambio(setLimiteForm)}>
            <option value="semanal">Semanal</option>
            <option value="mensual">Mensual</option>
          </select>

          <label>Maximo de citas</label>
          <input
            type="number"
            min="1"
            name="max_appointments"
            value={limiteForm.max_appointments}
            onChange={manejarCambio(setLimiteForm)}
            required
          />

          <label>Estado</label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              name="active"
              checked={limiteForm.active}
              onChange={manejarCambio(setLimiteForm)}
              style={{ width: "auto" }}
            />
            <span>Tope activo</span>
          </div>

          <button type="submit" className="admin-primary-button">
            Crear tope
          </button>
        </form>

        <table className="reportes-tabla">
          <thead>
            <tr>
              <th>EPS</th>
              <th>Especialidad</th>
              <th>Periodo</th>
              <th>Maximo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {limites.map((limite) => (
              <tr key={limite.id}>
                <td>{limite.eps_name}</td>
                <td>{limite.specialty_name || "Todas"}</td>
                <td>{limite.period}</td>
                <td>{limite.max_appointments}</td>
                <td>
                  <span className={`badge ${limite.active ? "status-activo" : "status-inactivo"}`}>
                    {limite.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="cancel-appointment-button"
                    onClick={() => eliminarRegistro("/rules/limits/", limite.id, "Tope eliminado correctamente.")}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-form-card" style={{ marginTop: "22px" }}>
        <h2>Presupuesto por EPS</h2>
        <form
          className="admin-form-grid"
          onSubmit={(e) =>
            crearRegistro(
              e,
              "/rules/budgets/",
              presupuestoForm,
              () => setPresupuestoForm(presupuestoInicial),
              "Presupuesto creado correctamente.",
            )
          }
        >
          <label>EPS</label>
          {renderSelectEPS(presupuestoForm.eps, manejarCambio(setPresupuestoForm))}

          <label>Especialidad</label>
          {renderSelectEspecialidad(presupuestoForm.specialty, manejarCambio(setPresupuestoForm))}

          <label>Inicio del periodo</label>
          <input
            type="date"
            name="period_start"
            value={presupuestoForm.period_start}
            onChange={manejarCambio(setPresupuestoForm)}
            required
          />

          <label>Fin del periodo</label>
          <input
            type="date"
            name="period_end"
            value={presupuestoForm.period_end}
            onChange={manejarCambio(setPresupuestoForm)}
            required
          />

          <label>Presupuesto total</label>
          <input
            type="number"
            min="0"
            step="0.01"
            name="total_budget"
            value={presupuestoForm.total_budget}
            onChange={manejarCambio(setPresupuestoForm)}
            required
          />

          <button type="submit" className="admin-primary-button">
            Crear presupuesto
          </button>
        </form>

        <table className="reportes-tabla">
          <thead>
            <tr>
              <th>EPS</th>
              <th>Especialidad</th>
              <th>Periodo</th>
              <th>Total</th>
              <th>Usado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {presupuestos.map((presupuesto) => (
              <tr key={presupuesto.id}>
                <td>{presupuesto.eps_name}</td>
                <td>{presupuesto.specialty_name || "Todas"}</td>
                <td>{presupuesto.period_start} a {presupuesto.period_end}</td>
                <td>{presupuesto.total_budget}</td>
                <td>{presupuesto.used_budget}</td>
                <td>
                  <button
                    type="button"
                    className="cancel-appointment-button"
                    onClick={() => eliminarRegistro("/rules/budgets/", presupuesto.id, "Presupuesto eliminado correctamente.")}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-form-card" style={{ marginTop: "22px" }}>
        <h2>Frecuencia por paciente</h2>
        <form
          className="admin-form-grid"
          onSubmit={(e) =>
            crearRegistro(
              e,
              "/rules/frequency/",
              frecuenciaForm,
              () => setFrecuenciaForm(frecuenciaInicial),
              "Restriccion de frecuencia creada correctamente.",
            )
          }
        >
          <label>Especialidad</label>
          {renderSelectEspecialidad(frecuenciaForm.specialty, manejarCambio(setFrecuenciaForm))}

          <label>Periodo</label>
          <select name="period" value={frecuenciaForm.period} onChange={manejarCambio(setFrecuenciaForm)}>
            <option value="semanal">Semanal</option>
            <option value="mensual">Mensual</option>
          </select>

          <label>Maximo por paciente</label>
          <input
            type="number"
            min="1"
            name="max_appointments_per_patient"
            value={frecuenciaForm.max_appointments_per_patient}
            onChange={manejarCambio(setFrecuenciaForm)}
            required
          />

          <button type="submit" className="admin-primary-button">
            Crear restriccion
          </button>
        </form>

        <table className="reportes-tabla">
          <thead>
            <tr>
              <th>Especialidad</th>
              <th>Periodo</th>
              <th>Maximo por paciente</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {frecuencias.map((frecuencia) => (
              <tr key={frecuencia.id}>
                <td>{frecuencia.specialty_name || "Todas"}</td>
                <td>{frecuencia.period}</td>
                <td>{frecuencia.max_appointments_per_patient}</td>
                <td>
                  <button
                    type="button"
                    className="cancel-appointment-button"
                    onClick={() => eliminarRegistro("/rules/frequency/", frecuencia.id, "Restriccion eliminada correctamente.")}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-form-card" style={{ marginTop: "22px" }}>
        <h2>Alertas</h2>
        <p>Alertas generadas cuando los topes o presupuestos se acercan al limite configurado.</p>

        <table className="reportes-tabla">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>EPS</th>
              <th>Especialidad</th>
              <th>Uso</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {alertas.length === 0 && (
              <tr>
                <td colSpan="5">No hay alertas activas.</td>
              </tr>
            )}
            {alertas.map((alerta, index) => (
              <tr key={`${alerta.type || "alerta"}-${index}`}>
                <td>{alerta.type || "Alerta"}</td>
                <td>{alerta.eps_name || alerta.eps || "Sin EPS"}</td>
                <td>{alerta.specialty_name || "Todas"}</td>
                <td>{alerta.usage_percentage || alerta.percentage || 0}%</td>
                <td>{alerta.message || alerta.detail || "Revisar configuracion."}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SuperAdminReglas;
