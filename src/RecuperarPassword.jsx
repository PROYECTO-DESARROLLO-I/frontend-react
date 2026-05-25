import { useState } from "react";
import "./App.css";
import { GoArrowLeft } from "react-icons/go";

function RecuperarPassword({ volverAlLogin }) {
    const [email, setEmail] = useState("");
    const [errorEmail, setErrorEmail] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [esExitoso, setEsExitoso] = useState(false);

    const validarEmail = (correo) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(correo);
    };

    const manejarCambioEmail = (e) => {
        setEmail(e.target.value);
        setErrorEmail(false);
        setMensaje("");
    };

    const manejarRecuperacion = (e) => {
        e.preventDefault();

        if (!email) {
            setErrorEmail(true);
            setMensaje("Por favor, ingresa tu correo electrónico.");
            return;
        }

        if (!validarEmail(email)) {
            setErrorEmail(true);
            setMensaje("El formato de correo no es válido.");
            return;
        }

        setEsExitoso(true);
        setMensaje("¡Listo! Hemos enviado las instrucciones de recuperación a tu correo.");
    };

    return (
        <div className="der">
            <div className="atras" onClick={volverAlLogin}>
                <GoArrowLeft />
                <p>Volver al inicio de sesión</p>
            </div>

            <div className="forms">
                <h2>Recuperar Contraseña</h2>
                <p style={{ fontSize: "14px", color: "grey", marginBottom: "20px" }}>
                    Ingresa el correo electrónico asociado a tu cuenta de SaludAgendaX y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                <div className="campos" style={{ width: "100%" }}>
                    Correo electrónico
                    <input
                        type="email"
                        placeholder="usuario@ejemplo.com"
                        value={email}
                        onChange={manejarCambioEmail}
                        className={errorEmail ? "input-error" : ""}
                        disabled={esExitoso}
                    />

                    {mensaje && (
                        <p style={{
                            color: esExitoso ? "#2e7d32" : "#DE300D",
                            fontSize: "13px",
                            fontWeight: "bold",
                            marginTop: "10px"
                        }}>
                            {mensaje}
                        </p>
                    )}
                </div>

                {!esExitoso && (
                    <button className="enviar" onClick={manejarRecuperacion}>
                        Enviar instrucciones
                    </button>
                )}
            </div>
        </div>
    );
}

export default RecuperarPassword;