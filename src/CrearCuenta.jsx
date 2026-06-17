import "./App.css";
import Card from "./Card";
import { GoArrowLeft } from "react-icons/go";
import { useState } from "react";

function CrearCuenta({ volverLogin }) {
  const [date_birth, setFecha] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [document_type, setDocumentType] = useState("");
  const [identity_document, setIdentityDocument] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [eps, setEps] = useState("");
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const [errorPassword, setErrorPassword] = useState(false);
  const [errorTelefono, setErrorTelefono] = useState(false);
  const [errorDireccion, setErrorDireccion] = useState(false);
  const [errorTipoDocumento, setErrorTipoDocumento] = useState(false);
  const [errorNumeroDocumento, setErrorNumeroDocumento] = useState(false);
  const [errorFecha, setErrorFecha] = useState(false);
  const [errorEps, setErrorEps] = useState(false);
  const [errorEmail, setErrorEmail] = useState(false);

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

  const manejarRegistro = async () => {
    setErrorEmail(false);
    setErrorPassword(false);
    setErrorTipoDocumento(false);
    setErrorNumeroDocumento(false);
    setErrorFecha(false);
    setErrorTelefono(false);
    setErrorDireccion(false);
    setErrorEps(false);
    setMensajeError("");

    if (
      !nombre ||
      !apellido ||
      !email ||
      !password ||
      !document_type ||
      !identity_document ||
      !date_birth ||
      !phone_number ||
      !address ||
      !eps
    ) {
      setErrorEmail(!email);
      setErrorPassword(!password);
      setErrorTipoDocumento(!document_type);
      setErrorNumeroDocumento(!identity_document);
      setErrorFecha(!date_birth);
      setErrorTelefono(!phone_number);
      setErrorDireccion(!address);
      setErrorEps(!eps);
      setMensajeError("Por favor, digita todos tus datos.");
      return;
    }

    if (!validarEmail(email)) {
      setErrorEmail(true);
      setMensajeError("El formato de correo no es valido.");
      return;
    }

    if (email === password) {
      setErrorPassword(true);
      setMensajeError("La contrasena no puede ser igual al correo.");
      return;
    }

    if (password.length < 8) {
      setErrorPassword(true);
      setMensajeError("La contrasena debe tener minimo 8 caracteres.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/auth/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          apellido,
          email,
          password,
          document_type,
          identity_document,
          date_birth,
          phone_number,
          address,
          eps: Number(eps),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensajeError(data.detail || "Error al crear la cuenta.");
        return;
      }

      setMostrarMensaje(true);
    } catch {
      setMensajeError("Error de conexion. Por favor, intenta nuevamente.");
    }
  };

  return (
    <div className="comp">
      <div className="izq">
        <Card />
      </div>

      <div className="der">
        <div className="forms">
          <div className="atras" onClick={volverLogin}>
            <GoArrowLeft />
            <p>Volver al login</p>
          </div>

          <h2>Crear Cuenta</h2>

          <div className="campos">
            <label>Nombre</label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />

            <label>Apellido</label>
            <input
              type="text"
              placeholder="Tu apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
            />

            <label>Correo electronico</label>
            <input
              type="email"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={manejarCambioEmail}
              className={errorEmail ? "input-error" : ""}
            />

            <label>Contrasena</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={manejarCambioPassword}
              className={errorPassword ? "input-error" : ""}
            />

            <label>Tipo de documento</label>
            <select
              value={document_type}
              onChange={(e) => {
                setDocumentType(e.target.value);
                setErrorTipoDocumento(false);
                setMensajeError("");
              }}
              className={errorTipoDocumento ? "input-error" : ""}
            >
              <option value="">Selecciona un tipo de documento</option>
              <option value="CC">Cedula de Ciudadania</option>
              <option value="CE">Cedula de Extranjeria</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="PAS">Pasaporte</option>
            </select>

            <label>Numero de documento</label>
            <input
              type="text"
              placeholder="12679436"
              maxLength={10}
              value={identity_document}
              onChange={(e) => {
                setIdentityDocument(e.target.value);
                setErrorNumeroDocumento(false);
                setMensajeError("");
              }}
              className={errorNumeroDocumento ? "input-error" : ""}
            />

            <label>Fecha de nacimiento</label>
            <input
              type="date"
              value={date_birth}
              onChange={(e) => {
                setFecha(e.target.value);
                setErrorFecha(false);
                setMensajeError("");
              }}
              max={new Date().toISOString().split("T")[0]}
              className={errorFecha ? "input-error" : ""}
            />

            <label>Numero de telefono</label>
            <input
              type="text"
              placeholder="315487652"
              maxLength={10}
              value={phone_number}
              onChange={(e) => {
                setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""));
                setErrorTelefono(false);
                setMensajeError("");
              }}
              className={errorTelefono ? "input-error" : ""}
            />

            <label>Direccion</label>
            <input
              type="text"
              placeholder="cl 33f #34-15"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setErrorDireccion(false);
                setMensajeError("");
              }}
              className={errorDireccion ? "input-error" : ""}
            />

            <label>EPS</label>
            <select
              value={eps}
              onChange={(e) => {
                setEps(e.target.value);
                setErrorEps(false);
                setMensajeError("");
              }}
              className={errorEps ? "input-error" : ""}
            >
              <option value="">Selecciona un tipo EPS</option>
              <option value="1">Sura</option>
              <option value="2">Compensar</option>
              <option value="3">Famisanar</option>
              <option value="4">Medisalud</option>
            </select>

            <p className="mensaje-error">{mensajeError}</p>
          </div>

          <button className="enviar" onClick={manejarRegistro}>
            Registrarse
          </button>

          {mostrarMensaje && (
            <div className="notificacion">
              <div className="notificacion-contenido">
                <h3>Cuenta creada</h3>
                <p>Ya puedes iniciar sesion con tu nueva cuenta. Vuelve al Login</p>
                <button onClick={() => setMostrarMensaje(false)}>Cerrar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CrearCuenta;
