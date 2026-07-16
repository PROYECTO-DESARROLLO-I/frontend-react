import { useMemo, useState } from "react";
import "./App.css";
import AdminReportes from "./AdminReportes";
import RegistroSedes from "./RegistroSedes";
import SuperAdminDisponibilidad from "./SuperAdminDisponibilidad";
import SuperAdminEspecialidades from "./SuperAdminEspecialidades";
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
        <p>Desde este panel puedes entrar a las areas globales.</p>

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
          <button type="button" className="cambiar_horario" onClick={() => cambiarVista("disponibilidad")}>
            Gestionar disponibilidad
          </button>
          <button type="button" className="cambiar_horario" onClick={() => cambiarVista("reglas")}>
            Reglas de negocio
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
        {vistaSuperAdmin === "especialidades" && <SuperAdminEspecialidades />}
        {vistaSuperAdmin === "sedes" && <RegistroSedes volverAlDashboard={() => setVistaSuperAdmin("sedes")} />}
        {vistaSuperAdmin === "disponibilidad" && <SuperAdminDisponibilidad />}
        {vistaSuperAdmin === "reglas" && <SuperAdminReglas />}
      </SuperAdminLayout>
    </div>
  );
}

export default SuperAdmin;
