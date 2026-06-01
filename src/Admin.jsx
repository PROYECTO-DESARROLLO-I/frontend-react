import { useState } from "react";
import "./App.css";
import Navbar from "./Navbar";
import RegistroPersonal from "./RegistroPersonal";
import RegistroSedes from "./RegistroSedes";

function Admin({ volverAlDashboard }) {
  const [vistaAdmin, setVistaAdmin] = useState("panel");

  if (vistaAdmin === "registroPersonal") {
    return (
      <RegistroPersonal volverAlDashboard={() => setVistaAdmin("panel")} />
    );
  }

  if (vistaAdmin === "crearSede") {
    return (
      <RegistroSedes volverAlDashboard={() => setVistaAdmin("panel")} />
    );
  }

  return (
    <div className="admin-container">
      <Navbar
        irRegistroPersonal={() => setVistaAdmin("registroPersonal")}
        cerrarSesion={volverAlDashboard}
        irCrearSede={() => setVistaAdmin("crearSede")}
      />

      <h2>Panel Administrativo</h2>
      <p>Bienvenido al modulo de administracion.</p>

    </div>
  );
}

export default Admin;
