import { useState } from "react";
import "./App.css";
import paciente from "./assets/paciente.png";
import Card from "./Card";
import RecuperarPassword from "./RecuperarPassword";
import RegistroPersonal from "./RegistroPersonal";
import PerfilPaciente from "./PerfilPaciente";

function Usuario({irCrearCuenta}){
    const [vistaActual, setVistaActual] = useState("login");
    const [rolUsuario, setRolUsuario] = useState("");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [errorEmail, setErrorEmail] = useState(false);
    const [errorPassword, setErrorPassword] = useState(false);
    const [mensajeError, setMensajeError] = useState("");

    const validarEmail = (correo) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(correo);
    };

    const manejarCambioEmail = (e) => {
      setEmail(e.target.value);
      setErrorEmail(false);
      setMensajeError("");
    };

    const manejarCambioPassword = (e) => {
        setPassword(e.target.value);
        setErrorPassword(false);
        setMensajeError("");
    };

    const manejarLogin = () => {
        setErrorEmail(false);
        setErrorPassword(false);

        if (!email && !password) {
            setErrorEmail(true);
            setErrorPassword(true);
            setMensajeError("Por favor, digita tus datos.");
            return;
        }

        if (!validarEmail(email)) {
            setErrorEmail(true);
            setMensajeError("El formato de correo no es válido.");
            return;
        }

        if (password.trim().length === 0) {
            setErrorPassword(true);
            setMensajeError("Por favor, digita una contraseña.");
            return;
        }

        if (email.includes("admin")) {
            setRolUsuario("admin");
            setVistaActual("dashboard_admin");
        } else {
            setRolUsuario("paciente");
            setVistaActual("dashboard_paciente");
        }
    };

    if (vistaActual === "recuperar") {
        return (
            <div className="comp">
                <div className="izq">
                    <Card />
                </div>
                <RecuperarPassword volverAlLogin={() => setVistaActual("login")} />
            </div>
        );
    }

    if (vistaActual === "dashboard_admin") {
        return (
            <div className="comp">
                <div className="izq">
                    <Card />
                </div>

                {rolUsuario === "admin" ? (
                    <RegistroPersonal volverAlDashboard={() => {
                        setVistaActual("login");
                        setRolUsuario("");
                        setEmail("");
                        setPassword("");
                    }} />
                ) : (
                    <div className="der">
                        <div className="forms">
                            <h2 style={{ color: "#DE300D" }}>Acceso Restringido</h2>
                            <p>No tienes los permisos necesarios para ver este módulo.</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (vistaActual === "dashboard_paciente") {
        return (
            <div className="comp">
                <div className="izq">
                    <Card />
                </div>

                {rolUsuario === "paciente" ? (
                    <PerfilPaciente volverAlDashboard={() => {
                        setVistaActual("login");
                        setRolUsuario("");
                        setEmail("");
                        setPassword("");
                    }} />
                ) : (
                    <div className="der">
                        <div className="forms">
                            <h2 style={{ color: "#DE300D" }}>Acceso Restringido</h2>
                            <p>Ocurrió un error con los permisos de tu perfil.</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return(
    <div className="comp">
        <div className="izq">
            <Card />
        </div>

        <div className="der">
        
        <div className="forms">
            <img src={String(paciente)} alt="Inicio de sesión para Pacientes" />
                <h4>Ingresa tu Usuario</h4>
                <p>Solicita y gestiona tus citas médicas</p>
            
            <div className="campos">
                Correo electrónico
                <input type="email" placeholder="usuario@ejemplo.com" value={email} onChange={manejarCambioEmail}
                className={errorEmail ? "input-error" : ""} />

                Contraseña
                <input type="password" placeholder="...." value={password} onChange={manejarCambioPassword}
                className={errorPassword ? "input-error" : ""} />

                {mensajeError && (<p style={{ color: "#DE300D", fontSize: "13px", fontWeight: "bold", marginTop: "10px" }}>
                    {mensajeError}
                </p>)}
            </div>
            
            <button className="enviar" onClick={manejarLogin}>
                Iniciar sesión
            </button>

     <div className="recuperar_contraseña"
          onClick={() => setVistaActual("recuperar")}
          style={{ cursor: "pointer", margin: "16px 0" }}
     >
            Recuperar Constraseña
     </div>
        <div className="crear_cuenta" onClick={irCrearCuenta} style={{ cursor: "pointer", marginTop: "20px" }}>
            Crear Cuenta
            </div>
        </div>
        </div>
    </div>
    );
}

export default Usuario;