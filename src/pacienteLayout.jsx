import "./App.css";
import PacienteSidebar from "./pacienteSidebar.jsx";

const paciente = JSON.parse(localStorage.getItem("paciente")) || {};


function PacienteLayout({ vistaActual, cambiarVista, cerrarSesion, children }) {
    return (
        <div className="admin-layout">
            <PacienteSidebar
            vistaActual={vistaActual}
            cambiarVista={cambiarVista}
            cerrarSesion={cerrarSesion}
            
            />
            
            <main className="admin-main">
                <header className="admin-topbar">
                    <div>
                        {parseInt(localStorage.getItem("userId")) && (
                            <p>Bienvenido, {localStorage.getItem("userName")}</p>
                        )}
                        <p>Gestiona tus citas médicas de forma sencilla y eficiente</p>
                    </div>
                </header>
                <section className="admin-content">
                    {children}
                </section>
            </main>
        </div>
    );
}

export default PacienteLayout;
