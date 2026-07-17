import AgendamientoCitas from "./agendamientoCitas.jsx";

function CitasPaciente({ volverAlDashboard, alFinalizar }) {
  const idPaciente = localStorage.getItem("userId");
  const nombrePaciente = localStorage.getItem("userName") || "Paciente";

  return (
      <AgendamientoCitas patientId={idPaciente} patientName={nombrePaciente} volverAlDashboard={volverAlDashboard} alFinalizar={alFinalizar} />
  );
}

export default CitasPaciente;
