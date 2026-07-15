import { useState } from "react";
import "./App.css";
import AdminLayout from "./AdminLayout";
import CitasAdmin from "./citasAdmin.jsx";
import RegistroPersonal from "./RegistroPersonal";
import RegistroSedes from "./RegistroSedes";
import AdminReportes from "./AdminReportes";

function Admin({ volverAlDashboard }) {
  const [vistaAdmin, setVistaAdmin] = useState("registroPersonal");

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
          
        </AdminLayout>
    </div>
  );
}

export default Admin;
