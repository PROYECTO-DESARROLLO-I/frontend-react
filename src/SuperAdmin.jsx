import { useMemo, useState } from "react";
import "./App.css";
import AdminReportes from "./AdminReportes";
import RegistroSedes from "./RegistroSedes";
import SuperAdminDisponibilidad from "./SuperAdminDisponibilidad";
import SuperAdminEspecialidades from "./SuperAdminEspecialidades";
import SuperAdminLayout from "./SuperAdminLayout";
import SuperAdminReglas from "./SuperAdminReglas";
import BannerLateral from "./BannerLateral"; // <-- IMPORTADO

function SuperAdminResumen({ cambiarVista }) {
  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  // Definición de las acciones principales con un icono y descripción breve
  const accesosRapidos = [
    { vista: "reportes", titulo: "Revisar Reportes", desc: "Monitoreo y estadísticas globales de la plataforma." },
    { vista: "especialidades", titulo: "Especialidades", desc: "Administración del catálogo de servicios médicos." },
    { vista: "sedes", titulo: "Gestionar Sedes", desc: "Configuración física y sedes de atención." },
    { vista: "disponibilidad", titulo: "Disponibilidad", desc: "Control de franjas horarias y asignaciones." },
    { vista: "reglas", titulo: "Reglas de Negocio", desc: "Parámetros globales y lógica de agendamiento." }
  ];

  return (
      <div className="admin-form-page" style={{ padding: 0 }}>
        <div className="admin-form-card" style={{ margin: 0, padding: "30px" }}>

          {/* Encabezado de Bienvenida */}
          <div style={{ marginBottom: "25px" }}>
            <h2 style={{ fontSize: "1.6rem", color: "#1f2937", margin: "0 0 6px 0" }}>
              Bienvenido(a), {usuario.nombre || "SuperAdmin"}
            </h2>
            <p style={{ color: "#4b5563", fontSize: "0.95rem" }}>
              Selecciona una de las áreas globales del sistema para comenzar la administración.
            </p>
          </div>

          {/* GRID DE TARJETAS DE ACCIÓN RÁPIDA */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginTop: "10px"
          }}>
            {accesosRapidos.map((item) => (
                <button
                    key={item.vista}
                    type="button"
                    onClick={() => cambiarVista(item.vista)}
                    style={{
                      background: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      padding: "20px",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      fontFamily: "inherit"
                    }}
                    // Pequeño truco inline para simular hover con JS si no usas CSS externo
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#6d28d9";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(109, 40, 217, 0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                    }}
                >
                  <div style={{ fontSize: "1.8rem", marginBottom: "4px" }}>
                    {item.icono}
                  </div>
                  <h4 style={{
                    fontSize: "1.05rem",
                    fontWeight: "bold",
                    color: "#111827",
                    margin: 0
                  }}>
                    {item.titulo}
                  </h4>
                  <p style={{
                    fontSize: "0.8rem",
                    color: "#6b7280",
                    margin: 0,
                    lineHeight: "1.3"
                  }}>
                    {item.desc}
                  </p>
                </button>
            ))}
          </div>

        </div>
      </div>
  );
}
function SuperAdmin({ volverAlDashboard }) {
  const [vistaSuperAdmin, setVistaSuperAdmin] = useState("resumen");

  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  return (
      <div className="admin-container">
        <SuperAdminLayout
            vistaActual={vistaSuperAdmin}
            cambiarVista={setVistaSuperAdmin}
            cerrarSesion={volverAlDashboard}
        >
          {/* Grid global para SuperAdmin */}
          <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "24px", alignItems: "start", width: "100%" }}>

            {/* COLUMNA IZQUIERDA: Pestaña activa */}
            <div>
              {vistaSuperAdmin === "resumen" && <SuperAdminResumen cambiarVista={setVistaSuperAdmin} />}
              {vistaSuperAdmin === "reportes" && <AdminReportes />}
              {vistaSuperAdmin === "especialidades" && <SuperAdminEspecialidades />}
              {vistaSuperAdmin === "sedes" && <RegistroSedes volverAlDashboard={() => setVistaSuperAdmin("sedes")} />}
              {vistaSuperAdmin === "disponibilidad" && <SuperAdminDisponibilidad />}
              {vistaSuperAdmin === "reglas" && <SuperAdminReglas />}
            </div>

            {/* COLUMNA DERECHA: Banner con datos de SuperAdmin */}
            <BannerLateral
                rol="SuperAdmin"
                nombreUsuario={usuario.nombre || "Super Administrador"}
                slogan="Máximo nivel de configuración y auditoría del ecosistema médico."
                recomendaciones={[
                  "Cualquier cambio en las reglas de negocio afectará de inmediato el agendamiento de citas de todos los pacientes.",
                  "Mantenga actualizadas las especialidades activas para garantizar la consistencia médica."
                ]}
            />

          </div>
        </SuperAdminLayout>
      </div>
  );
}

export default SuperAdmin;