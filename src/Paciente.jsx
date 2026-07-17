import PacienteLayout from "./pacienteLayout.jsx";
import CitasPaciente from "./citasPaciente.jsx";
import CitasAgendadasPaciente from "./CitasAgendadasPaciente.jsx";
import PerfilPaciente from "./PerfilPaciente";
import { useState, useMemo } from "react";
import BannerLateral from "./BannerLateral"; // <-- IMPORTADO

function Paciente({ volverAlDashboard }) {
  const [vistaPaciente, setVistaPaciente] = useState("visualizar");

  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  return (
      <div className="admin-container">
        <PacienteLayout
            vistaActual={vistaPaciente}
            cambiarVista={setVistaPaciente}
            cerrarSesion={volverAlDashboard}
        >
          {/* Grid global para Paciente */}
          <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "24px", alignItems: "start", width: "100%" }}>

            {/* COLUMNA IZQUIERDA: Pestaña activa */}
            <div>
              {vistaPaciente === "visualizar" && <CitasAgendadasPaciente />}
              {vistaPaciente === "PerfilPaciente" && <PerfilPaciente volverAlDashboard={() => setVistaPaciente("visualizar")} />}
              {vistaPaciente === "agendarCita" && (
                  <CitasPaciente
                      volverAlDashboard={() => setVistaPaciente("visualizar")}
                      alFinalizar={() => setVistaPaciente("visualizar")}
                  />
              )}
            </div>

            {/* COLUMNA DERECHA: Banner con datos del Paciente */}
            <BannerLateral
                rol="Paciente"
                nombreUsuario={usuario.nombre || "Estimado Paciente"}
                slogan="Tu salud es lo más importante para nosotros. Agenda y controla tus consultas fácilmente."
                recomendaciones={[
                  "Recuerda llegar 15 minutos antes de la hora programada para tu consulta.",
                  "Puedes cancelar o reprogramar tu cita con un mínimo de 12 horas de anticipación."
                ]}
            />

          </div>
        </PacienteLayout>
      </div>
  );
}

export default Paciente;