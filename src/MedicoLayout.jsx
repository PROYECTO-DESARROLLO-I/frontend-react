import "./App.css";
import MedicoSidebar from "./MedicoSidebar";

function MedicoLayout({ vistaActual, cambiarVista, cerrarSesion, children }) {
    const usuarioGuardado = JSON.parse(localStorage.getItem("user")) || {};

    const primerNombre = usuarioGuardado.nombre || "";
    const primerApellido = usuarioGuardado.apellido || "";

    const nombreCompletoDoc = `${primerNombre} ${primerApellido}`.trim();

    return (
        <div className="admin-layout">
            <MedicoSidebar
                vistaActual={vistaActual}
                cambiarVista={cambiarVista}
                cerrarSesion={cerrarSesion}
            />

            <main className="admin-main">
                <header className="admin-topbar">
                    <div>
                        {nombreCompletoDoc ? (
                            <p style={{ fontWeight: "bold", fontSize: "18px", margin: 0 }}>
                                Bienvenido(a), Dr(a). {nombreCompletoDoc}
                            </p>
                        ) : (
                            <p style={{ fontWeight: "bold", fontSize: "18px", margin: 0 }}>
                                Bienvenido(a), Profesional de la Salud
                            </p>
                        )}
                        <p>Consulte y gestione el estado de sus consultas asignadas</p>
                    </div>
                </header>
                <section className="admin-content">
                    {children}
                </section>
            </main>
        </div>
    );
}

export default MedicoLayout;