import { useState } from "react";
import MedicoLayout from "./MedicoLayout";
import CitasMedico from "./CitasMedico";

function Medico({ volverAlDashboard }) {
    const [vistaMedico, setVistaMedico] = useState("agenda");

    return (
        <div className="admin-container">
            <MedicoLayout
                vistaActual={vistaMedico}
                cambiarVista={setVistaMedico}
                cerrarSesion={volverAlDashboard}
            >
                {vistaMedico === "agenda" && <CitasMedico />}
                {vistaMedico === "historial" && (
                    <div className="admin-form-card">
                        <h2>Historial de Pacientes</h2>
                        <p>Módulo en desarrollo: Visualización de historias clínicas previas.</p>
                    </div>
                )}
            </MedicoLayout>
        </div>
    );
}

export default Medico;