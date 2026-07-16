import { useState } from "react";
import "./App.css";
import { GoArrowLeft } from "react-icons/go";

function RecuperarPassword({ volverAlLogin }) {
    const [email, setEmail] = useState("");
    const [errorEmail, setErrorEmail] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [esExitoso, setEsExitoso] = useState(false);
    const [cargando, setCargando] = useState(false);

    const validarEmail = (correo) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(correo);
    };

    const manejarCambioEmail = (e) => {
        setEmail(e.target.value);
        setErrorEmail(false);
        setMensaje("");
    };

    const manejarRecuperacion = async (e) => {
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

        setCargando(true);
        setMensaje("");

        try {
            const response = await fetch("http://localhost:8000/api/auth/password-reset/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: email.trim() }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setErrorEmail(true);
                setMensaje(data.detail || "Ocurrió un error al procesar tu solicitud.");
                return;
            }

            // Django responde exitosamente sin revelar si el correo existe por seguridad
            setEsExitoso(true);
            setMensaje("¡Listo! Si el correo está registrado, hemos enviado las instrucciones de recuperación.");
        } catch (error) {
            setErrorEmail(true);
            setMensaje("Error de conexión con el servidor. Inténtalo más tarde.");
        } finally {
            setCargando(false);
        }
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
                        disabled={esExitoso || cargando}
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
                    <button
                        className="enviar"
                        onClick={manejarRecuperacion}
                        disabled={cargando}
                    >
                        {cargando ? "Enviando..." : "Enviar instrucciones"}
                    </button>
                )}
            </div>
        </div>
    );
}

export default RecuperarPassword;