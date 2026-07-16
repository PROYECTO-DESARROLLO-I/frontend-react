import { useMemo, useState } from "react";
import "./App.css";
import AdminEspecialidades from "./AdminEspecialidades";
import AdminReportes from "./AdminReportes";
import RegistroSedes from "./RegistroSedes";
import SuperAdminLayout from "./SuperAdminLayout";
import SuperAdminReglas from "./SuperAdminReglas";

function SuperAdminResumen({ cambiarVista }) {
  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  return (
    <div className="admin-form-page">
      <div className="admin-form-card">
        <h2>Bienvenido(a), {usuario.nombre || "SuperAdmin"}</h2>
        <p>Desde este panel puedes administrar configuraciones globales y monitorear el sistema.</p>

        <div className="reportes-bar-chart">
          <button type="button" className="admin-primary-button" onClick={() => cambiarVista("reportes")}>
            Revisar reportes
          </button>
          <button type="button" className="cambiar_horario" onClick={() => cambiarVista("especialidades")}>
            Gestionar especialidades
          </button>
          <button type="button" className="cambiar_horario" onClick={() => cambiarVista("sedes")}>
            Gestionar sedes
          </button>
          <button type="button" className="cambiar_horario" onClick={() => cambiarVista("reglas")}>
            Configurar reglas de negocio
          </button>
        </div>
      </div>
    </div>
  );
}

function SuperAdmin({ volverAlDashboard }) {
  const [vistaSuperAdmin, setVistaSuperAdmin] = useState("resumen");

  return (
    <div className="admin-container">
      <SuperAdminLayout
        vistaActual={vistaSuperAdmin}
        cambiarVista={setVistaSuperAdmin}
        cerrarSesion={volverAlDashboard}
      >
        {vistaSuperAdmin === "resumen" && <SuperAdminResumen cambiarVista={setVistaSuperAdmin} />}
        {vistaSuperAdmin === "reportes" && <AdminReportes />}
        {vistaSuperAdmin === "especialidades" && <AdminEspecialidades />}
        {vistaSuperAdmin === "sedes" && <RegistroSedes volverAlDashboard={() => setVistaSuperAdmin("sedes")} />}
        {vistaSuperAdmin === "reglas" && <SuperAdminReglas />}
      </SuperAdminLayout>
    </div>
  );
}

export default SuperAdmin;
