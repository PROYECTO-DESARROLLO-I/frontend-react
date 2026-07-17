import { useState, useMemo } from "react";
import MedicoLayout from "./MedicoLayout";
import CitasMedico from "./CitasMedico";
import DisponibilidadMedico from "./DisponibilidadMedico";
import BuscadorPacientes from "./BuscadorPacientes";
import BannerLateral from "./BannerLateral"; // <-- IMPORTADO

function Medico({ volverAlDashboard }) {
    const [vistaMedico, setVistaMedico] = useState("agenda");

    const usuario = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || {};
        } catch {
            return {};
        }
    }, []);

    return (
        <div className="admin-container">
            <MedicoLayout
                vistaActual={vistaMedico}
                cambiarVista={setVistaMedico}
                cerrarSesion={volverAlDashboard}
            >
                {/* Grid global para Médico */}
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "24px", alignItems: "start", width: "100%" }}>

                    {/* COLUMNA IZQUIERDA: Pestaña activa */}
                    <div>
                        {vistaMedico === "agenda" && <CitasMedico />}
                        {vistaMedico === "disponibilidad" && <DisponibilidadMedico />}
                        {vistaMedico === "historial" && <BuscadorPacientes />}
                    </div>

                    {/* COLUMNA DERECHA: Banner con datos del Médico */}
                    <BannerLateral
                        rol="Medico"
                        nombreUsuario={usuario.nombre || "Profesional de la Salud"}
                        slogan="Comprometidos con el bienestar y la gestión eficiente de tu salud."
                        recomendaciones={[
                            "Al reprogramar, se notificará automáticamente vía correo electrónico al paciente asignado.",
                            "Las citas canceladas liberan inmediatamente el cupo correspondiente en el sistema."
                        ]}
                    />

                </div>
            </MedicoLayout>
        </div>
    );
}

export default Medico;