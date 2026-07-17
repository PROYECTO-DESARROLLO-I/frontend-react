import { useState, useEffect } from "react";
import { API_URL } from "./apiConfig";
import "./App.css";
import paciente from "./assets/paciente.png";
import Card from "./Card";
import Admin from "./Admin";
import RecuperarPassword from "./RecuperarPassword";
import RestablecerPassword from "./RestablecerPassword";
import Paciente from "./Paciente";
import Medico from "./Medico";
import SuperAdmin from "./SuperAdmin";
import { GoEye, GoEyeClosed } from "react-icons/go";

function Usuario({ irCrearCuenta }) {
  const [vistaActual, setVistaActual] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState(false);
  const [errorPassword, setErrorPassword] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeExitoLogin, setMensajeExitoLogin] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const irVistaPorRol = (rol) => {
    if (rol === "superadmin") {
      setVistaActual("superadmin");
    } else if (rol === "administrativo" || rol === "admin") {
      setVistaActual("admin");
    } else if (rol === "paciente") {
      setVistaActual("paciente");
    } else if (rol === "medico") {
      setVistaActual("medico");
    } else {
      setMensajeError("Tu rol aÃºn no tiene una vista asignada en el front.");
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const uid = queryParams.get("uid");
    const token = queryParams.get("token");

    if (uid && token) {
      setVistaActual("restablecer");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    const verificarSesion = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/auth/me/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          return;
        }

        localStorage.setItem("user", JSON.stringify(data));
        irVistaPorRol(data?.rol);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
    };

    verificarSesion();
  }, []);

  const validarEmail = (correo) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
  };

  const limpiarLogin = (desdeRestablecimientoExitoso = false) => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    const urlLimpia = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({ path: urlLimpia }, "", urlLimpia);

    setVistaActual("login");
    setEmail("");
    setPassword("");
    setErrorEmail(false);
    setErrorPassword(false);
    setMensajeError("");

    if (desdeRestablecimientoExitoso === true) {
      setMensajeExitoLogin("¡Tu contraseña ha sido actualizada con éxito! Ya puedes ingresar.");
    } else {
      setMensajeExitoLogin("");
    }
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
    setMensajeExitoLogin("");
  };

  const manejarLogin = async () => {
    setErrorEmail(false);
    setErrorPassword(false);
    setMensajeError("");
    setMensajeExitoLogin("");

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
      const response = await fetch(`${API_URL}/api/auth/login/`, {
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

      if (rol === "superadmin") {
        setVistaActual("superadmin");
      } else if (rol === "administrativo" || rol === "admin") {
        setVistaActual("admin");
      } else if (rol === "paciente") {
        setVistaActual("paciente");
      } else if (rol === "medico") {
        setVistaActual("medico");
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

  if (vistaActual === "restablecer") {
    return (
        <div className="comp">
          <div className="izq">
            <Card />
          </div>
          <RestablecerPassword volverAlLogin={limpiarLogin} />
        </div>
    );
  }

  if (vistaActual === "admin") {
    return <Admin volverAlDashboard={limpiarLogin} />;
  }

  if (vistaActual === "superadmin") {
    return <SuperAdmin volverAlDashboard={limpiarLogin} />;
  }

  if (vistaActual === "paciente") {
    return <Paciente volverAlDashboard={limpiarLogin} />;
  }

  if (vistaActual === "medico") {
    return <Medico volverAlDashboard={limpiarLogin} />;
  }

  return (
    <div className="comp">
      <div className="izq">
        <Card />
      </div>

      <div className="der">
        <div className="forms">
          {mensajeExitoLogin && (
              <div style={{
                backgroundColor: "#e8f5e9",
                border: "1px solid #a5d6a7",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "15px",
                width: "100%",
                boxSizing: "border-box",
                textAlign: "center"
              }}>
                <p style={{
                  color: "#2e7d32",
                  margin: 0,
                  fontSize: "13.5px",
                  fontWeight: "bold"
                }}>
                  {mensajeExitoLogin}
                </p>
              </div>
          )}

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
            <div className="password-input-wrap">
              <input
                type={mostrarPassword ? "text" : "password"}
                placeholder="...."
                value={password}
                onChange={manejarCambioPassword}
                className={errorPassword ? "input-error" : ""}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setMostrarPassword((valor) => !valor)}
                aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                title={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarPassword ? <GoEyeClosed /> : <GoEye />}
              </button>
            </div>

            <p className="mensaje-error">{mensajeError}</p>
          </div>

          <button className="enviar" onClick={manejarLogin}>
            Iniciar sesión
          </button>

          <div
            className="recuperar_contraseña"
            onClick={() => setVistaActual("recuperar")}
            style={{ cursor: "pointer", margin: "16px 0" }}
          >
            Recuperar Contraseña
          </div>

          <div
            className="crear_cuenta"
            onClick={irCrearCuenta}
            style={{ cursor: "pointer", marginTop: "20px" }}
          >
            Crear cuenta
          </div>
        </div>
      </div>
    </div>
  );
}

export default Usuario;
