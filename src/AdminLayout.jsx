import "./App.css";
import AdminSidebar from "./AdminSidebar";

function AdminLayout({ vistaActual, cambiarVista, cerrarSesion, children }) {
    return (
        <div className="admin-layout">
            <AdminSidebar
            vistaActual={vistaActual}
            cambiarVista={cambiarVista}
            cerrarSesion={cerrarSesion}
            
            />
            
            <main className="admin-main">
                <header className="admin-topbar">
                    <div>
                        <h1>Panel de Administración</h1>
                        <p>Gestiona sedes, personal y procesos de SaludAgendaX</p>
                    </div>
                </header>
                <section className="admin-content">
                    {children}
                </section>
            </main>
        </div>
    );
}

export default AdminLayout;
