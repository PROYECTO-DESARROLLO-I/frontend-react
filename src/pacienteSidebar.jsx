import "./App.css";

function PacienteSidebar({ vistaActual, cambiarVista, cerrarSesion }) {
     return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <strong>SaludAgendaX</strong>
        <span>Paciente</span>
      </div>

      <nav className="admin-nav">
        <button
          className={vistaActual === "visualizar" ? "active" : ""}
          onClick={() => cambiarVista("visualizar")}
        >
          Citas agendadas
        </button>

        <button
          className={vistaActual === "agendarCita" ? "active" : ""}
          onClick={() => cambiarVista("agendarCita")}
        >
          Agendar Cita
        </button>

         <button
       className={vistaActual === "PerfilPaciente" ? "active" : ""}
         onClick={() => cambiarVista("PerfilPaciente")}
        >
            Perfil
             </button>
      </nav>
        
      <button className="admin-logout" onClick={cerrarSesion}>
        Cerrar sesion
      </button>
    </aside>
  );
}
export default PacienteSidebar;
