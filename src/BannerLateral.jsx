import React from "react";

function BannerLateral({ rol, nombreUsuario, slogan, recomendaciones = [] }) {
    // Definimos colores y estilos según el rol para que visualmente se identifique al instante
    const estilosPorRol = {
        medico: {
            gradient: "linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%)",
            border: "#fee2e2",
            accentText: "#dc2626",
            badgeBg: "#dc2626"
        },
        admin: {
            gradient: "linear-gradient(135deg, #f0fdf4 0%, #f0fdf4 100%)",
            border: "#bbf7d0",
            accentText: "#15803d",
            badgeBg: "#15803d"
        },
        superadmin: {
            gradient: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
            border: "#ddd6fe",
            accentText: "#6d28d9",
            badgeBg: "#6d28d9"
        },
        paciente: {
            gradient: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
            border: "#bae6fd",
            accentText: "#0369a1",
            badgeBg: "#0369a1"
        }
    };

    const config = estilosPorRol[rol?.toLowerCase()] || estilosPorRol.paciente;

    return (
        <div style={{
            background: config.gradient,
            border: `1px solid ${config.border}`,
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            height: "fit-content",
            position: "sticky",
            top: "20px"
        }}>
            <span style={{
                color: config.accentText,
                fontSize: "0.75rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "1px",
                display: "block",
                marginBottom: "4px"
            }}>
                Panel {rol}
            </span>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "bold", color: "#1f2937", margin: "0 0 10px 0" }}>
                {nombreUsuario}
            </h3>

            {slogan && (
                <p style={{ fontSize: "0.85rem", color: "#4b5563", lineHeight: "1.4", margin: "0 0 15px 0", fontStyle: "italic" }}>
                    "{slogan}"
                </p>
            )}

            {recomendaciones.length > 0 && (
                <>
                    <hr style={{ border: "0", borderTop: `1px solid ${config.border}`, margin: "15px 0" }} />
                    <div style={{ fontSize: "0.8rem", color: "#4b5563" }}>
                        <strong style={{ display: "block", color: config.accentText, marginBottom: "6px" }}>
                            Recomendaciones del sistema:
                        </strong>
                        <ul style={{ paddingLeft: "15px", margin: "0", spaceY: "6px" }}>
                            {recomendaciones.map((rec, index) => (
                                <li key={index} style={{ marginBottom: "6px" }}>{rec}</li>
                            ))}
                        </ul>
                    </div>
                </>
            )}

            <div style={{
                marginTop: "20px",
                background: config.badgeBg,
                color: "white",
                borderRadius: "8px",
                padding: "12px",
                textAlign: "center"
            }}>
                <span style={{ fontSize: "0.7rem", fontWeight: "bold", textTransform: "uppercase", opacity: "0.9" }}>Aplicación Oficial</span>
                <h4 style={{ fontSize: "1rem", fontWeight: "bold", margin: "2px 0 0 0" }}>SaludAgendaX</h4>
            </div>
        </div>
    );
}

export default BannerLateral;