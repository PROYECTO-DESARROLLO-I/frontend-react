import "./App.css";

function MedicoSidebar({ vistaActual, cambiarVista, cerrarSesion }) {
    return (
        <aside className="admin-sidebar">
            <div className="admin-brand">
                <strong>SaludAgendaX</strong>
                <span>Personal Médico</span>
            </div>

            <nav className="admin-nav">
                <button
                    className={vistaActual === "agenda" ? "active" : ""}
                    onClick={() => cambiarVista("agenda")}
                >
                    Mi Agenda del Día
                </button>

                <button
                    className={vistaActual === "historial" ? "active" : ""}
                    onClick={() => cambiarVista("historial")}
                >
                    Historial de Pacientes
                </button>

                <button
                    className={vistaActual === "disponibilidad" ? "active" : ""}
                    onClick={() => cambiarVista("disponibilidad")}
                >
                    Mi Disponibilidad
                </button>
            </nav>

            <button className="admin-logout" onClick={cerrarSesion}>
                Cerrar sesión
            </button>
        </aside>
    );
}

export default MedicoSidebar;
