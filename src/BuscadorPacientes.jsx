import React, { useState, useEffect } from "react";
import { API_URL } from "./apiConfig";

function BuscadorPacientes() {
    const [citas, setCitas] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        const cargarDatos = async () => {
            setCargando(true);
            try {
                const token = localStorage.getItem("accessToken");
                const response = await fetch(`${API_URL}/api/appointments/doctor/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setCitas(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Error cargando pacientes:", err);
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, []);

    // Extraer pacientes únicos para que no salgan repetidos si tienen varias citas
    const pacientesUnicos = [];
    const idsVistos = new Set();

    citas.forEach((cita) => {
        const nombre = cita.patient_name || "Paciente sin nombre";
        if (nombre && !idsVistos.has(nombre)) {
            idsVistos.add(nombre);
            pacientesUnicos.push({
                nombre: nombre,
                especialidad: cita.specialty_name || "Medicina General",
                duracion: cita.duration_minutes || 30,
                ultimaCita: cita.scheduled_at
            });
        }
    });

    const filtrados = pacientesUnicos.filter((p) =>
        p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(
            busqueda.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        )
    );

    return (
        <div className="admin-form-card animate-aparecer">
            <h2>Directorio de Pacientes</h2>
            <p>Consulte de forma rápida el listado de pacientes que tiene o ha tenido asignados en sus consultas.</p>

            <div style={{ margin: "20px 0" }}>
                <input
                    type="text"
                    placeholder="Buscar paciente por nombre..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{
                        width: "100%",
                        maxWidth: "400px",
                        padding: "10px 14px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "0.95rem"
                    }}
                />
            </div>

            {cargando ? (
                <p style={{ color: "grey" }}>Cargando pacientes...</p>
            ) : filtrados.length === 0 ? (
                <p style={{ fontStyle: "italic", color: "#666" }}>No se encontraron pacientes asignados.</p>
            ) : (
                <table className="reportes-tabla">
                    <thead>
                    <tr>
                        <th>Nombre del Paciente</th>
                        <th>Última Especialidad Atendida</th>
                        <th>Última Consulta</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtrados.map((paciente, idx) => (
                        <tr key={idx}>
                            <td><strong>{paciente.nombre}</strong></td>
                            <td>{paciente.especialidad}</td>
                            <td>{new Date(paciente.ultimaCita).toLocaleDateString("es-CO")}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default BuscadorPacientes;