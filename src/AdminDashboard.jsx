import { useEffect, useState } from "react";
import { API_URL } from "./apiConfig";
import "./App.css";

function AdminDashboard() {
    const [kpis, setKpis] = useState({
        totalToday: 0,
        pending: 0,
        confirmed: 0,
        cancelled: 0,
        cancellationRate: 0,
    });
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const obtenerKpis = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                const response = await fetch(`${API_URL}/api/dashboard/kpis/`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setKpis({
                        totalToday: data.total_today,
                        pending: data.by_status.pending,
                        confirmed: data.by_status.confirmed,
                        cancelled: data.by_status.cancelled,
                        cancellationRate: data.cancellation_rate_percent
                    });
                }
            } catch (err) {
                console.error("Error al cargar KPIs del dashboard", err);
            } finally {
                setCargando(false);
            }
        };

        obtenerKpis().catch((err) => {
            console.error("Error asíncrono en obtenerKpis:", err);
        });
    }, []);

    return (
        <div className="admin-reportes-container"> {/* Clase de tu CSS para layout ancho */}

            {/* SECCIÓN 1: Gestión Global */}
            <div className="resultados-card"> {/* Clase de tu CSS con fondo blanco y bordes suaves */}
                <h3 style={{ margin: "0 0 16px 0", color: "#111827", fontSize: "18px", fontWeight: "700" }}>
                    Infraestructura y Personal
                </h3>
                <div className="admin-dashboard"> {/* Tu grid de 3 columnas */}
                    <div className="admin-card">
                        <div>
                            <span>Personal</span>
                            <strong>24</strong>
                            <p>Usuarios internos registrados</p>
                        </div>
                    </div>

                    <div className="admin-card">
                        <div>
                            <span>Sedes</span>
                            <strong>5</strong>
                            <p>Sedes activas en la región</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 2: Monitoreo de Operación en Tiempo Real (KPIs de Django) */}
            <div className="resultados-card">
                <h3 style={{ margin: "0 0 16px 0", color: "#111827", fontSize: "18px", fontWeight: "700" }}>
                    Operación del Día (Tiempo Real)
                </h3>

                {cargando ? (
                    <p style={{ textAlign: "center", color: "grey", fontStyle: "oblique" }}>
                        Cargando métricas en tiempo real...
                    </p>
                ) : (
                    <div className="admin-dashboard">
                        <div className="admin-card" style={{ borderColor: "#DE300D" }}>
                            <div>
                                <span>Citas de Hoy</span>
                                <strong>{kpis.totalToday}</strong>
                                <p>Agendadas para la fecha actual</p>
                            </div>
                        </div>

                        <div className="admin-card">
                            <div>
                                <span>Confirmadas vs Pendientes</span>
                                <strong>{kpis.confirmed} / {kpis.pending}</strong>
                                <p>Listas para atención médica</p>
                            </div>
                        </div>

                        <div className="admin-card">
                            <div>
                                <span style={{ color: "#DE300D" }}>Tasa de Cancelación</span>
                                <strong style={{ color: "#DE300D" }}>{kpis.cancellationRate}%</strong>
                                <p>Total canceladas hoy: {kpis.cancelled}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}

export default AdminDashboard;