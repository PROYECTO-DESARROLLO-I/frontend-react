import { useState } from "react";
import "./App.css";
import { GoArrowLeft } from "react-icons/go";

function RegistroSedes({ volverAlDashboard }) {
  const [nombreSede, setNombreSede] = useState("");
  const [direccionSede, setDireccionSede] = useState("");
  const [telefonoSede, setTelefonoSede] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const obtenerMensajeError = (respuesta) => {
    if (respuesta?.detail) return respuesta.detail;
    const primerError = Object.values(respuesta || {})[0];
    if (Array.isArray(primerError)) return primerError[0];
    if (typeof primerError === "string") return primerError;
    return "Error al crear la sede.";
  };

  const leerRespuesta = async (response) => {
    const text = await response.text();
    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      return { detail: text };
    }
  };

  const renovarToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) return null;

    const response = await fetch("http://localhost:8000/api/auth/token/refresh/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await leerRespuesta(response);

    if (!response.ok || !data.access) return null;

    localStorage.setItem("accessToken", data.access);

    if (data.refresh) {
      localStorage.setItem("refreshToken", data.refresh);
    }

    return data.access;
  };

  const crearSede = async (token) => {
    return fetch("http://localhost:8000/api/headquarters/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: nombreSede.trim(),
        address: direccionSede.trim(),
        phone: telefonoSede.trim(),
        active: true,
      }),
    });
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setMensajeError("");
    setMostrarMensaje(false);

    if (!nombreSede.trim() || !direccionSede.trim() || !telefonoSede.trim()) {
      setMensajeError("Por favor, completa todos los datos de la sede.");
      return;
    }

    const token = localStorage.getItem("accessToken");

    if (!token) {
      setMensajeError("No hay una sesion activa. Inicia sesion nuevamente.");
      return;
    }

    setGuardando(true);

    try {
      let sedeData = await crearSede(token);
      let sedeResponse = await leerRespuesta(sedeData);

      if (sedeData.status === 401) {
        const nuevoToken = await renovarToken();

        if (nuevoToken) {
          sedeData = await crearSede(nuevoToken);
          sedeResponse = await leerRespuesta(sedeData);
        }
      }

      if (!sedeData.ok) {
        setMensajeError(obtenerMensajeError(sedeResponse));
        return;
      }

      setMostrarMensaje(true);
      setNombreSede("");
      setDireccionSede("");
      setTelefonoSede("");
    } catch {
      setMensajeError("Error de conexion. Por favor, intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="admin-form-page">
      <div className="admin-back" onClick={volverAlDashboard}>
        <GoArrowLeft />
        <p>Volver al Panel Administrativo</p>
      </div>

      <form className="admin-form-card" onSubmit={manejarRegistro}>
        <h2>Crear Sede</h2>
        <p>Registra una nueva sede para la plataforma.</p>

        <div className="admin-form-grid">
          <label>Nombre de la sede</label>
          <input
            type="text"
            placeholder="Ej. Sede Norte"
            value={nombreSede}
            onChange={(e) => setNombreSede(e.target.value)}
          />

          <label>Direccion</label>
          <input
            type="text"
            placeholder="Ej. Calle 33 #34-15"
            value={direccionSede}
            onChange={(e) => setDireccionSede(e.target.value)}
          />

          <label>Telefono</label>
          <input
            type="text"
            placeholder="Ej. 3154876520"
            maxLength={10}
            value={telefonoSede}
            onChange={(e) => {
              setTelefonoSede(e.target.value.replace(/[^0-9]/g, ""));
            }}
          />

          <p className="mensaje-error">{mensajeError}</p>
        </div>

        <button className="admin-primary-button" type="submit" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar Sede"}
        </button>

        {mostrarMensaje && (
          <div className="notificacion">
            <div className="notificacion-contenido">
              <h3>Sede creada</h3>
              <p>La sede fue registrada correctamente.</p>
              <button type="button" onClick={() => setMostrarMensaje(false)}>
                Cerrar
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default RegistroSedes;
