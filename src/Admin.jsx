import { useState } from "react";
import "./App.css";
import AdminLayout from "./AdminLayout";
import CitasAdmin from "./citasAdmin.jsx";
import RegistroPersonal from "./RegistroPersonal";
import RegistroSedes from "./RegistroSedes";
import AdminReportes from "./AdminReportes";
import AdminPacientes from "./AdminPacientes";
import AdminEspecialidades from "./AdminEspecialidades";

function Admin({ volverAlDashboard }) {
  const [vistaAdmin, setVistaAdmin] = useState("reportes");

  return (
    <div className="admin-container">
      <AdminLayout
        vistaActual={vistaAdmin}
        cambiarVista={setVistaAdmin}
        cerrarSesion={volverAlDashboard}
        >
          {vistaAdmin === "reportes" && <AdminReportes />}
          {vistaAdmin === "registroPersonal" && <RegistroPersonal volverAlDashboard={() => setVistaAdmin("registroPersonal")} />}
          {vistaAdmin === "crearSede" && <RegistroSedes volverAlDashboard={() => setVistaAdmin("registroPersonal")} />}
          {vistaAdmin === "agendarCita" && <CitasAdmin volverAlDashboard={() => setVistaAdmin("registroPersonal")} />}
          {vistaAdmin === "pacientes" && <AdminPacientes />}
          {vistaAdmin === "especialidades" && <AdminEspecialidades />}
          
        </AdminLayout>
    </div>
  );
}

export default Admin;
