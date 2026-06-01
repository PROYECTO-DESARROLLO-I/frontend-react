import "./App.css";
import Card from "./Card";
import { GoArrowLeft } from "react-icons/go";
import { useState } from "react";

function CrearCuenta({ volverLogin }) {

  //creacion de constantes
    const [fecha, setFecha] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nombre, setNombre] = useState("");
    const [tipoDocumento, setTipoDocumento] = useState("");
    const [numeroDocumento, setNumeroDocumento] = useState("");
    const [telefono, setTelefono] = useState("");
    const [direccion, setDireccion] = useState("");
    const [eps, setEps] = useState("");
    const [mostrarMensaje, setMostrarMensaje] = useState(false);

    const [mensajeError, setMensajeError] = useState("");

//Errores de validación

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

    const manejarLogin = () => {
        setErrorEmail(false);
        setErrorPassword(false);

        if (!email && !password && !tipoDocumento && !numeroDocumento && !fecha && !telefono && !direccion && !eps) {
            setErrorEmail(true);
            setErrorPassword(true);
            setErrorTipoDocumento(true);
            setErrorNumeroDocumento(true);
            setErrorFecha(true);
            setErrorTelefono(true);
            setErrorDireccion(true);
            setErrorEps(true);
            setMensajeError("Por favor, digita tus datos.");

            return;
        }

        if (!validarEmail(email)) {
            setErrorEmail(true);
            setMensajeError("El formato de correo no es válido.");
            return;
        }
        if(email == password) {
            setErrorPassword(true);
            setMensajeError("La contraseña no puede ser igual al correo.");
            return;
        }
        if (password.length < 8 ) {
            setErrorPassword(true);
            setMensajeError("La contraseña debe tener mínimo 8 caracteres.");
            return;
        }
        if(tipoDocumento === "") {
            setErrorTipoDocumento(true);
            setMensajeError("Por favor, selecciona un tipo de documento.");
            return;
        }

        if(numeroDocumento.trim().length === 0) {
            setErrorNumeroDocumento(true);
            setMensajeError("Por favor, digita un número de documento.");
            return;
        }
        if(fecha === "") {
            setErrorFecha(true);
            setMensajeError("Por favor, selecciona una fecha de nacimiento.");
            return;
        }
        if (telefono.trim().length === 0) {
            setErrorTelefono(true);
            setMensajeError("Por favor, digita un número de teléfono.");
            return;
        }
          if (direccion.trim().length === 0) {
            setErrorDireccion(true);
            setMensajeError("Por favor, digita una dirección.");
            return;
        }
      
        
        if(eps === "") {
            setErrorEps(true);
            setMensajeError("Por favor, selecciona una EPS.");
            return;
        }

        setMostrarMensaje(true);
        
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
            <input type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}/>

            <label>Correo electrónico</label>
            <input type="email" placeholder="usuario@ejemplo.com" value={email} onChange={manejarCambioEmail} 
            className={errorEmail ? "input-error" : ""}/>

            <label>Contraseña</label>
            <input type="password" placeholder="••••••••" value={password} onChange={manejarCambioPassword} 
            className={errorPassword ? "input-error" : ""}/>

            <label>Tipo de documento</label>
            <select value={tipoDocumento} onChange={(e) => {setTipoDocumento(e.target.value); setErrorTipoDocumento(false); setMensajeError("");}} className={errorTipoDocumento ? "input-error" : ""}>
                <option value="">Selecciona un tipo de documento</option>
                <option value="cc">Cédula de Ciudadanía</option>
                <option value="ce">Cédula de Extranjería</option>
                <option value="ti">Tarjeta de Identidad</option>
                <option value="pasaporte">Pasaporte</option>
                <option value="PPT">PPT</option>
                <option value="PEP">PEP</option>
            </select>

            <label>Numero de documento</label>
            <input type="text" placeholder="12679436" maxLength={10} value={numeroDocumento} onChange={(e) => {setNumeroDocumento(e.target.value); setErrorNumeroDocumento(false); setMensajeError("");}} className={errorNumeroDocumento ? "input-error" : ""} />

            <label>Fecha de nacimiento</label>
            <input type="date" value={fecha} onChange={(e)=> {setFecha(e.target.value); setErrorFecha(false); setMensajeError("");}} max={new Date().toISOString().split("T")[0]} className={errorFecha ? "input-error" : ""} />

            <label>Numero de telefono</label>
            <input type="text" placeholder="315487652" maxLength={10} value={telefono} onChange={(e) => {setTelefono(e.target.value); setErrorTelefono(false); setMensajeError("");}} 
            onInput={(e)=> { e.target.value = e.target.value.replace(/[^0-9]/g, "");
            }} className={errorTelefono ? "input-error" : ""}/>

            <label>Dirección</label>
            <input type="text" placeholder="cl 33f #34-15" value={direccion} onChange={(e) => {setDireccion(e.target.value); setErrorDireccion(false); setMensajeError("");}} className={errorDireccion ? "input-error" : ""} />

            <label>EPS</label>
            <select value={eps} onChange={(e) => {setEps(e.target.value); setErrorEps(false); setMensajeError("");}} className={errorEps ? "input-error" : ""}>
                <option value="">Selecciona un tipo EPS</option>
                <option value="sura">Sura</option>
                <option value="compensar">Compensar</option>
                <option value="famisanar">Famisanar</option>
                <option value="medisalud">Medisalud</option>
            </select>

            <p className="mensaje-error">
            {mensajeError}
          </p>
          </div>

          <button className="enviar" onClick={manejarLogin}>
            Registrarse
          </button>

          {/* Sirve para el archivo de notificaciones */}

          {mostrarMensaje && (
            <div className="notificacion">
              
              <div className="notificacion-contenido">

                <h3>Cuenta creada</h3>

                <p>
                  Ya puedes iniciar sesión con tu nueva cuenta. Vuelve al Login
                </p>

                <button onClick={() => setMostrarMensaje(false)}>
                  Cerrar
                </button>

              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CrearCuenta;
