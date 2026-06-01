import { useState } from "react";
import "./App.css";
import paciente from "./assets/paciente.png";
import Card from "./Card";
import Admin from "./Admin";
import RecuperarPassword from "./RecuperarPassword";
import PerfilPaciente from "./PerfilPaciente";

function Usuario({ irCrearCuenta }) {
  const [vistaActual, setVistaActual] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState(false);
  const [errorPassword, setErrorPassword] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const validarEmail = (correo) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
  };

  const limpiarLogin = () => {
    setVistaActual("login");
    setEmail("");
    setPassword("");
    setErrorEmail(false);
    setErrorPassword(false);
    setMensajeError("");
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
      setMensajeError("El formato de correo no es valido.");
      return;
    }

    if (password.trim().length === 0) {
      setErrorPassword(true);
      setMensajeError("Por favor, digita una contrasena.");
      return;
    }

    setVistaActual(email.toLowerCase().includes("admin") ? "admin" : "paciente");
  };

  if (vistaActual === "recuperar") {
    return (
      <div className="comp">
        <div className="izq">
          <Card />
        </div>
        <RecuperarPassword volverAlLogin={limpiarLogin} />
      </div>
    );
  }

  if (vistaActual === "admin") {
    return <Admin volverAlDashboard={limpiarLogin} />;
  }

  if (vistaActual === "paciente") {
    return (
      <div className="comp">
        <div className="izq">
          <Card />
        </div>
        <PerfilPaciente volverAlDashboard={limpiarLogin} />
      </div>
    );
  }

  return (
    <div className="comp">
      <div className="izq">
        <Card />
      </div>

      <div className="der">
        <div className="forms">
          <img src={String(paciente)} alt="Inicio de sesion para Pacientes" />
          <h4>Ingresa tu Usuario</h4>
          <p>Solicita y gestiona tus citas medicas</p>

          <div className="campos">
            Correo electronico
            <input
              type="email"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={manejarCambioEmail}
              className={errorEmail ? "input-error" : ""}
            />

            Contrasena
            <input
              type="password"
              placeholder="...."
              value={password}
              onChange={manejarCambioPassword}
              className={errorPassword ? "input-error" : ""}
            />

            <p className="mensaje-error">{mensajeError}</p>
          </div>

          <button className="enviar" onClick={manejarLogin}>
            Iniciar sesion
          </button>

          <div
            className="recuperar_contrasena"
            onClick={() => setVistaActual("recuperar")}
            style={{ cursor: "pointer", margin: "16px 0" }}
          >
            Recuperar Contrasena
          </div>

          <div
            className="crear_cuenta"
            onClick={irCrearCuenta}
            style={{ cursor: "pointer", marginTop: "20px" }}
          >
            Crear Cuenta
          </div>
        </div>
      </div>
    </div>
  );
}

export default Usuario;
