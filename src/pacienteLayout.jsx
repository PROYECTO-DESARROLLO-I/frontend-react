import "./App.css";
import PacienteSidebar from "./pacienteSidebar.jsx";

function PacienteLayout({ vistaActual, cambiarVista, cerrarSesion, children }) {
    const usuarioGuardado = JSON.parse(localStorage.getItem("user")) || {};

    const primerNombre = usuarioGuardado.nombre || "";
    const primerApellido = usuarioGuardado.apellido || "";

    const nombreCompleto = `${primerNombre} ${primerApellido}`.trim();

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
                        {nombreCompleto ? (
                            <p style={{ fontWeight: "bold", fontSize: "18px", margin: 0 }}>
                                Bienvenido(a), {nombreCompleto}
                            </p>
                        ) : (
                            <p style={{ fontWeight: "bold", fontSize: "18px", margin: 0 }}>
                                Bienvenido(a), Paciente
                            </p>
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
