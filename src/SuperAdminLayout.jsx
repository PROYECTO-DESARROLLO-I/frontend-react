import "./App.css";
import SuperAdminSidebar from "./SuperAdminSidebar";

function SuperAdminLayout({ vistaActual, cambiarVista, cerrarSesion, children }) {
  return (
    <div className="admin-layout">
      <SuperAdminSidebar
        vistaActual={vistaActual}
        cambiarVista={cambiarVista}
        cerrarSesion={cerrarSesion}
      />

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>Panel SuperAdmin</h1>
            <p>Administra reglas, reportes y configuracion general de SaludAgendaX</p>
          </div>
        </header>

        <section className="admin-content">{children}</section>
      </main>
    </div>
  );
}

export default SuperAdminLayout;
