import { useState } from "react";
import "./App.css";
import { GoArrowLeft } from "react-icons/go";

function RegistroSedes({ volverAlDashboard }) {
  const [nombreSede, setNombreSede] = useState("");
  const [direccionSede, setDireccionSede] = useState("");
  const [telefonoSede, setTelefonoSede] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [mostrarMensaje, setMostrarMensaje] = useState(false);

  const manejarRegistro = (e) => {
    e.preventDefault();
    setMensajeError("");

    if (!nombreSede.trim() || !direccionSede.trim() || !telefonoSede.trim()) {
      setMensajeError("Por favor, completa todos los datos de la sede.");
      return;
    }

    setMostrarMensaje(true);
    setNombreSede("");
    setDireccionSede("");
    setTelefonoSede("");
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

        <button className="admin-primary-button" type="submit">
          Guardar Sede
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
