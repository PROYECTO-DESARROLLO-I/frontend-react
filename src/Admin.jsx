import { useState } from "react";
import "./App.css";
import AdminLayout from "./AdminLayout";
import CitasAdmin from "./citasAdmin.jsx";
import AdminDashboard from "./AdminDashboard";
import RegistroPersonal from "./RegistroPersonal";
import RegistroSedes from "./RegistroSedes";
import AdminReportes from "./AdminReportes";

function Admin({ volverAlDashboard }) {
  const [vistaAdmin, setVistaAdmin] = useState("panel");

  return (
    <div className="admin-container">
      <AdminLayout
        vistaActual={vistaAdmin}
        cambiarVista={setVistaAdmin}
        cerrarSesion={volverAlDashboard}
        >
          {vistaAdmin === "registroPersonal" && <RegistroPersonal volverAlDashboard={() => setVistaAdmin("panel")} />}
          {vistaAdmin === "crearSede" && <RegistroSedes volverAlDashboard={() => setVistaAdmin("panel")} />}
          {vistaAdmin === "agendarCita" && <CitasAdmin volverAlDashboard={() => setVistaAdmin("panel")} />}
          {vistaAdmin === "reportes" && <AdminReportes />}
        </AdminLayout>
    </div>
  );
}

export default Admin;
