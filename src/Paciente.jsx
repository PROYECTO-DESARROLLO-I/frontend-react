import PacienteLayout from "./pacienteLayout.jsx";
import CitasAdmin from "./citasAdmin.jsx";
import AdminDashboard from "./AdminDashboard";
import PerfilPaciente from "./PerfilPaciente";
import RegistroPersonal from "./RegistroPersonal";
import RegistroSedes from "./RegistroSedes";
import { useState } from "react";

function Paciente({ volverAlDashboard }) {
  const [vistaPaciente, setVistaPaciente] = useState("visualizar");

  return (
    <div className="admin-container">
      <PacienteLayout
        vistaActual={vistaPaciente}
        cambiarVista={setVistaPaciente}
        cerrarSesion={volverAlDashboard}
        >
          {vistaPaciente === "visualizar" && <AdminDashboard />}
          {vistaPaciente === "cancelarCita" && <RegistroPersonal volverAlDashboard={() => setVistaPaciente("visualizar")} />}
          {vistaPaciente === "PerfilPaciente" && <PerfilPaciente volverAlDashboard={() => setVistaPaciente("visualizar")} />}
          {vistaPaciente === "reprogramarCita" && <RegistroSedes volverAlDashboard={() => setVistaPaciente("visualizar")} />}
          {vistaPaciente === "agendarCita" && <CitasAdmin volverAlDashboard={() => setVistaPaciente("visualizar")} />}
        </PacienteLayout>
    </div>
  );
}

export default Paciente;
