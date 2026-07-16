import "./App.css";

function AdminSidebar({ vistaActual, cambiarVista, cerrarSesion }) {
    return (
        <aside className="admin-sidebar">
            <div className="admin-brand">
                <strong>SaludAgendaX</strong>
                <span>Admin</span>
            </div>

            <nav className="admin-nav">
                <button
                    className={vistaActual === "reportes" ? "active" : ""}
                    onClick={() => cambiarVista("reportes")}
                >
                    Reportes y Estadísticas
                </button>
                
                <button
                    className={vistaActual === "registroPersonal" ? "active" : ""}
                    onClick={() => cambiarVista("registroPersonal")}
                >
                    Registro de personal
                </button>

                <button
                    className={vistaActual === "crearSede" ? "active" : ""}
                    onClick={() => cambiarVista("crearSede")}
                >
                    Crear sede
                </button>

                <button
                    className={vistaActual === "agendarCita" ? "active" : ""}
                    onClick={() => cambiarVista("agendarCita")}
                >
                    Agendar Cita Paciente
                </button>

                <button
                    className={vistaActual === "pacientes" ? "active" : ""}
                    onClick={() => cambiarVista("pacientes")}
                >
                    Gestion de pacientes
                </button>

            </nav>
        
            <button className="admin-logout" onClick={cerrarSesion}>
                    Cerrar sesion
            </button>
        </aside>
    );
}
export default AdminSidebar;
