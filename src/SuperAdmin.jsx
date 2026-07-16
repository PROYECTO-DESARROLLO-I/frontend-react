import { useMemo, useState } from "react";
import "./App.css";
import AdminEspecialidades from "./AdminEspecialidades";
import AdminReportes from "./AdminReportes";
import RegistroSedes from "./RegistroSedes";
import SuperAdminLayout from "./SuperAdminLayout";

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
        <p>Desde este panel puedes entrar a las areas globales que ya permite el front.</p>

        <div className="superadmin-actions">
          <button type="button" className="admin-primary-button" onClick={() => cambiarVista("reportes")}>
            Revisar reportes
          </button>
          <button type="button" className="cambiar_horario" onClick={() => cambiarVista("especialidades")}>
            Ver especialidades
          </button>
          <button type="button" className="cambiar_horario" onClick={() => cambiarVista("sedes")}>
            Gestionar sedes
          </button>
          <button type="button" className="cambiar_horario" onClick={() => cambiarVista("reglas")}>
            Reglas de negocio
          </button>
        </div>
      </div>
    </div>
  );
}

function SuperAdminReglasPlaceholder() {
  return (
    <div className="admin-form-page">
      <div className="admin-form-card">
        <h2>Reglas de negocio</h2>
        <p>Esta seccion consume los endpoints existentes de reglas en el siguiente bloque.</p>
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
        {vistaSuperAdmin === "reglas" && <SuperAdminReglasPlaceholder />}
      </SuperAdminLayout>
    </div>
  );
}

export default SuperAdmin;
