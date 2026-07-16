import "./App.css";

function SuperAdminSidebar({ vistaActual, cambiarVista, cerrarSesion }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <strong>SaludAgendaX</strong>
        <span>SuperAdmin</span>
      </div>

      <nav className="admin-nav">
        <button className={vistaActual === "resumen" ? "active" : ""} onClick={() => cambiarVista("resumen")}>
          Resumen general
        </button>
        <button className={vistaActual === "reportes" ? "active" : ""} onClick={() => cambiarVista("reportes")}>
          Reportes y estadisticas
        </button>
        <button className={vistaActual === "especialidades" ? "active" : ""} onClick={() => cambiarVista("especialidades")}>
          Especialidades
        </button>
        <button className={vistaActual === "sedes" ? "active" : ""} onClick={() => cambiarVista("sedes")}>
          Sedes
        </button>
        <button className={vistaActual === "disponibilidad" ? "active" : ""} onClick={() => cambiarVista("disponibilidad")}>
          Disponibilidad
        </button>
        <button className={vistaActual === "reglas" ? "active" : ""} onClick={() => cambiarVista("reglas")}>
          Reglas de negocio
        </button>
      </nav>

      <button className="admin-logout" onClick={cerrarSesion}>
        Cerrar sesion
      </button>
    </aside>
  );
}

export default SuperAdminSidebar;
