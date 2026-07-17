import { useState, useMemo } from "react";
import "./App.css";
import AdminLayout from "./AdminLayout";
import CitasAdmin from "./citasAdmin.jsx";
import RegistroPersonal from "./RegistroPersonal";
import RegistroSedes from "./RegistroSedes";
import AdminReportes from "./AdminReportes";
import AdminPacientes from "./AdminPacientes";
import BannerLateral from "./BannerLateral"; // <-- IMPORTADO

function Admin({ volverAlDashboard }) {
  const [vistaAdmin, setVistaAdmin] = useState("reportes");

  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  return (
      <div className="admin-container">
        <AdminLayout
            vistaActual={vistaAdmin}
            cambiarVista={setVistaAdmin}
            cerrarSesion={volverAlDashboard}
        >
          {/* Usamos Grid para renderizar el contenido de la pestaña y el Banner lado a lado */}
          <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "24px", alignItems: "start", width: "100%" }}>

            {/* COLUMNA IZQUIERDA: Pestaña activa */}
            <div>
              {vistaAdmin === "reportes" && <AdminReportes />}
              {vistaAdmin === "registroPersonal" && <RegistroPersonal volverAlDashboard={() => setVistaAdmin("registroPersonal")} />}
              {vistaAdmin === "crearSede" && <RegistroSedes volverAlDashboard={() => setVistaAdmin("registroPersonal")} />}
              {vistaAdmin === "agendarCita" && (
                  <CitasAdmin
                      volverAlDashboard={() => setVistaAdmin("pacientes")}
                      alFinalizar={() => setVistaAdmin("pacientes")}
                  />
              )}
              {vistaAdmin === "pacientes" && <AdminPacientes />}
            </div>

            {/* COLUMNA DERECHA: Banner con datos de Admin */}
            <BannerLateral
                rol="Admin"
                nombreUsuario={usuario.nombre || "Administrador del Sistema"}
                slogan="Supervisión eficiente y control operativo de la red de salud."
                recomendaciones={[
                  "Recuerde que el registro de personal médico requiere validar el número de tarjeta profesional.",
                  "Al crear sedes, asigne correctamente los horarios globales de atención."
                ]}
            />

          </div>
        </AdminLayout>
      </div>
  );
}

export default Admin;