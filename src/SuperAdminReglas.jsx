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

  const normalizarLista = (data) => (Array.isArray(data) ? data : data.results || []);

  const mensajeDeError = (data, respaldo) => {
    if (data?.detail) return data.detail;
    if (data?.non_field_errors?.length) return data.non_field_errors[0];
    const primerError = Object.values(data || {})[0];
    if (Array.isArray(primerError)) return primerError[0];
    if (typeof primerError === "string") return primerError;
    return respaldo;
  };

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setMensajeError("");

    try {
      const respuestas = await Promise.all([
        fetch(`${API_BASE}/eps/`, { headers }),
        fetch(`${API_BASE}/specialties/`, { headers }),
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
      setMensajeError("No se pudo conectar con el servidor.");
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
      setMensajeError("No se pudo conectar con el servidor.");
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
      setMensajeError("No se pudo conectar con el servidor.");
    }
  };

  const selectEPS = (value, onChange) => (
    <select name="eps" value={value} onChange={onChange} required>
      <option value="">-- Seleccione EPS --</option>
      {eps.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  );

  const selectEspecialidad = (value, onChange) => (
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
    <div className="admin-form-page rules-page">
      <div className="admin-form-card">
        <h2>Reglas de negocio</h2>
        <p>Configura topes, presupuestos, frecuencia de citas y revisa alertas de consumo.</p>
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
          {selectEPS(limiteForm.eps, manejarCambio(setLimiteForm))}
          <label>Especialidad</label>
          {selectEspecialidad(limiteForm.specialty, manejarCambio(setLimiteForm))}
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
          <label>Activo</label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="checkbox"
              name="active"
              checked={limiteForm.active}
              onChange={manejarCambio(setLimiteForm)}
              style={{ width: "auto" }}
            />
            <span>Regla activa</span>
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
              <th>Accion</th>
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
          {selectEPS(presupuestoForm.eps, manejarCambio(setPresupuestoForm))}
          <label>Especialidad</label>
          {selectEspecialidad(presupuestoForm.specialty, manejarCambio(setPresupuestoForm))}
          <label>Inicio</label>
          <input type="date" name="period_start" value={presupuestoForm.period_start} onChange={manejarCambio(setPresupuestoForm)} required />
          <label>Fin</label>
          <input type="date" name="period_end" value={presupuestoForm.period_end} onChange={manejarCambio(setPresupuestoForm)} required />
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
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            {presupuestos.map((presupuesto) => (
              <tr key={presupuesto.id}>
                <td>{presupuesto.eps_name}</td>
                <td>{presupuesto.specialty_name || "Todas"}</td>
                <td>
                  {presupuesto.period_start} a {presupuesto.period_end}
                </td>
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
              "Restriccion creada correctamente.",
            )
          }
        >
          <label>Especialidad</label>
          {selectEspecialidad(frecuenciaForm.specialty, manejarCambio(setFrecuenciaForm))}
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
              <th>Maximo</th>
              <th>Accion</th>
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
        <h2>Alertas de reglas</h2>
        <p>Consulta alertas cuando una EPS se acerca a sus topes o presupuesto.</p>
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

        <p className="mensaje-error">
          Nota: el selector de especialidades usa /api/specialties/, que solo devuelve especialidades activas con disponibilidad.
        </p>
      </div>
    </div>
  );
}

export default SuperAdminReglas;
