import { useState } from "react";
import "./App.css";
import paciente from "./assets/paciente.png";
import Card from "./Card";
import RecuperarPassword from "./RecuperarPassword";
import RegistroPersonal from "./RegistroPersonal";
import PerfilPaciente from "./PerfilPaciente";

function Usuario({ irCrearCuenta }) {
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

  const limpiarLogin = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    setVistaActual("login");
    setRolUsuario("");
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

  const manejarLogin = async () => {
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

    try {
      const response = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensajeError(data.detail || "Error en el inicio de sesión.");
        return;
      }

      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      const rol = data.user?.rol;

      if (rol === "administrativo" || rol === "superadmin" || rol === "admin") {
        setRolUsuario("admin");
        setVistaActual("dashboard_admin");
      } else if (rol === "paciente") {
        setRolUsuario("paciente");
        setVistaActual("dashboard_paciente");
      } else {
        setMensajeError("Tu rol aún no tiene una vista asignada en el front.");
      }
    } catch {
      setMensajeError("No se pudo conectar con el servidor.");
    }
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

  if (vistaActual === "dashboard_admin") {
    return (
        <div className="comp">
          <div className="izq">
            <Card />
          </div>

          {rolUsuario === "admin" ? (
              <RegistroPersonal volverAlDashboard={limpiarLogin} />
          ) : (
              <div className="der">
                <div className="forms">
                  <h2 className="mensaje-error" style={{ fontSize: "24px" }}>Acceso Restringido</h2>
                  <p style={{ textAlign: "center", color: "gray" }}>No tienes los permisos necesarios para ver este módulo.</p>
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
              <PerfilPaciente volverAlDashboard={limpiarLogin} />
          ) : (
              <div className="der">
                <div className="forms">
                  <h2 className="mensaje-error" style={{ fontSize: "24px" }}>Acceso Restringido</h2>
                  <p style={{ textAlign: "center", color: "gray" }}>Ocurrió un error con los permisos de tu perfil.</p>
                </div>
              </div>
          )}
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
            <img src={String(paciente)} alt="Inicio de sesión para Pacientes" />
            <h4>Ingresa tu Usuario</h4>
            <p>Solicita y gestiona tus citas médicas</p>

            <div className="campos">
              Correo electrónico
              <input
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={manejarCambioEmail}
                  className={errorEmail ? "input-error" : ""}
              />

              Contraseña
              <input
                  type="password"
                  placeholder="...."
                  value={password}
                  onChange={manejarCambioPassword}
                  className={errorPassword ? "input-error" : ""}
              />

              {mensajeError && (
                  <p className="mensaje-error">
                    {mensajeError}
                  </p>
              )}
            </div>

            <button className="enviar" onClick={manejarLogin}>
              Iniciar sesión
            </button>

            <div
                className="recuperar_contraseña"
                onClick={() => setVistaActual("recuperar")}
            >
              Recuperar Contraseña
            </div>
            <div
                className="crear_cuenta"
                onClick={irCrearCuenta}
            >
              Crear Cuenta
            </div>
          </div>
        </div>
      </div>
  );
}

export default Usuario;
