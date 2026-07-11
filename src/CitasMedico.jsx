import { useState } from "react";
import "./App.css";

function CitasMedico() {
    // Datos simulados para testing del rol médico
    const [citas, setCitas] = useState([
        { id: 1, paciente: "Carlos Aristizábal", hora: "08:00 AM", motivo_consulta: "Control General", estado: "Atendida" },
        { id: 2, paciente: "Diana Marcela Ospina", hora: "09:30 AM", motivo_consulta: "Lectura de Exámenes", estado: "Programada" },
        { id: 3, paciente: "Andrés Felipe López", hora: "11:00 AM", motivo_consulta: "Dolor Lumbar", estado: "Programada" }
    ]);

    const marcarAtendida = (id) => {
        setCitas(citas.map(c => c.id === id ? { ...c, estado: "Atendida" } : c));
    };

    return (
        <div className="admin-form-page animate-aparecer">
            <h2>Mi Agenda de Consultas</h2>
            <p>Gestione las citas asignadas para su jornada de hoy.</p>

            <table className="reportes-tabla">
                <thead>
                <tr>
                    <th>Hora</th>
                    <th>Paciente</th>
                    <th>Motivo de Consulta</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody>
                {citas.map((cita) => (
                    <tr key={cita.id}>
                        <td><strong>{cita.hora}</strong></td>
                        <td>{cita.paciente}</td>
                        <td>{cita.motivo_consulta}</td>
                        <td>
                <span className={`badge ${cita.estado === "Atendida" ? "status-realizada" : "status-programada"}`}>
                  {cita.estado}
                </span>
                        </td>
                        <td>
                            {cita.estado === "Programada" ? (
                                <button
                                    className="admin-primary-button"
                                    style={{ padding: "6px 12px", fontSize: "12px", marginTop: 0 }}
                                    onClick={() => marcarAtendida(cita.id)}
                                >
                                    Atender
                                </button>
                            ) : (
                                <span style={{ color: "gray", fontSize: "13px" }}>✓ Concluida</span>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default CitasMedico;