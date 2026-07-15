import PacienteLayout from "./pacienteLayout.jsx";
import CitasPaciente from "./citasPaciente.jsx";
import CitasAgendadasPaciente from "./CitasAgendadasPaciente.jsx";
import PerfilPaciente from "./PerfilPaciente";
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
          {vistaPaciente === "visualizar" && <CitasAgendadasPaciente />}
          {vistaPaciente === "PerfilPaciente" && <PerfilPaciente volverAlDashboard={() => setVistaPaciente("visualizar")} />}
          {vistaPaciente === "agendarCita" && <CitasPaciente volverAlDashboard={() => setVistaPaciente("visualizar")} />}
        </PacienteLayout>
    </div>
  );
}

export default Paciente;
