import { useState } from "react";
import "./App.css";
import paciente from "./assets/paciente.png";
import Card from "./Card";
import { GoArrowLeft } from "react-icons/go";

function Paciente({volverInicio}){
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
            setMensajeError("Por favor digita tus datos.");
            return;
        }

        if (!validarEmail(email)) {
            setErrorEmail(true);
            setMensajeError("El formato de correo no es válido.");
            return;
        }

        if (password.trim().length === 0) {
            setErrorPassword(true);
            setMensajeError("Por favor digita una contraseña.");
            return;
        }

        alert("¡Validación exitosa!");
    };

    return(
    <div className="comp">
        <div className="izq">
            <Card />
        </div>

        <div className="der">
        <div className="atras" onClick={volverInicio}>
            <GoArrowLeft />
            <p>Cambiar tipo de usuario</p>
        </div>

        <div className="forms">
            <img src={String(paciente)} alt="Inicio de sesión para Pacientes" />
                Paciente
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
        </div>
        </div>
    </div>
    );
}

export default Paciente;