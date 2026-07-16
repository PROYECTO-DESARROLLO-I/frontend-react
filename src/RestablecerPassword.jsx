import { useState, useEffect } from "react";
import "./App.css";

function RestablecerPassword({ volverAlLogin }) {
    const [nuevaPassword, setNuevaPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");
    const [uid, setUid] = useState("");
    const [token, setToken] = useState("");

    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [esExitoso, setEsExitoso] = useState(false);
    const [errorCampos, setErrorCampos] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);

        // Obtenemos los valores brutos
        let rawUid = queryParams.get("uid") || "";
        let rawToken = queryParams.get("token") || "";

        // LIMPIEZA TOTAL:
        // 1. Quitamos cualquier '3D' que se coló.
        // 2. Quitamos todos los '=' que son basura de formato.
        rawUid = rawUid.replace(/3D/g, "").replace(/=/g, "");
        rawToken = rawToken.replace(/3D/g, "").replace(/=/g, "");

        console.log("=== DATOS LIMPIOS QUE SE VAN A ENVIAR ===");
        console.log("UID:", rawUid);
        console.log("Token:", rawToken);

        setUid(rawUid);
        setToken(rawToken);
    }, []);

    const manejarRestablecer = async (e) => {
        e.preventDefault();
        setErrorCampos(false);
        setMensaje("");

        if (!nuevaPassword || !confirmarPassword) {
            setErrorCampos(true);
            setMensaje("Por favor, completa todos los campos.");
            return;
        }

        if (nuevaPassword.length < 8) {
            setErrorCampos(true);
            setMensaje("La contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (nuevaPassword !== confirmarPassword) {
            setErrorCampos(true);
            setMensaje("Las contraseñas no coinciden.");
            return;
        }

        if (!uid || !token) {
            setErrorCampos(true);
            setMensaje("El enlace de recuperación parece incompleto o corrupto.");
            return;
        }

        setCargando(true);

        const payload = {
            uid: uid, // <-- Envía el valor tal cual llega de la URL, sin btoa
            token: token,
            new_password: nuevaPassword,
            confirm_password: confirmarPassword,
        };

        console.log("Enviando UID codificado a Django:", uid);

        try {
            const response = await fetch("http://localhost:8000/api/auth/password-reset/confirm/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            // Capturamos la respuesta del servidor como texto primero por si no es un JSON válido
            const respuestaTexto = await response.text();
            console.log("Código HTTP del servidor:", response.status);
            console.log("Respuesta cruda del servidor:", respuestaTexto);

            let data = {};
            try {
                data = JSON.parse(respuestaTexto);
            } catch (e) {
                // No era JSON
            }

            if (!response.ok) {
                setErrorCampos(true);
                // Si el backend nos mandó un mensaje de error detallado, lo mostramos
                const errorDetalle = data.detail || Object.values(data).flat().join(" ") || "El enlace ha expirado o es inválido.";
                setMensaje(errorDetalle);
                return;
            }

            setEsExitoso(true);
            setMensaje("¡Contraseña restablecida con éxito! Ya puedes iniciar sesión con tu nueva contraseña.");
        } catch (error) {
            console.error("Error capturado en el catch:", error);
            setErrorCampos(true);
            setMensaje("Error de conexión al restablecer la contraseña.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="der animate-aparecer">
            <div className="forms">
                <h2>Restablecer Contraseña</h2>
                <p style={{ fontSize: "14px", color: "grey", marginBottom: "20px" }}>
                    Ingresa y confirma tu nueva contraseña de acceso para SaludAgendaX.
                </p>

                <form onSubmit={manejarRestablecer} style={{ width: "100%" }}>
                    <div className="campos" style={{ width: "100%", marginBottom: "15px" }}>
                        Nueva Contraseña
                        <input
                            type="password"
                            placeholder="Mínimo 8 caracteres"
                            value={nuevaPassword}
                            onChange={(e) => {
                                setNuevaPassword(e.target.value);
                                setErrorCampos(false);
                                setMensaje("");
                            }}
                            className={errorCampos ? "input-error" : ""}
                            disabled={esExitoso || cargando}
                        />
                    </div>

                    <div className="campos" style={{ width: "100%", marginBottom: "15px" }}>
                        Confirmar Contraseña
                        <input
                            type="password"
                            placeholder="Repite tu contraseña"
                            value={confirmarPassword}
                            onChange={(e) => {
                                setConfirmarPassword(e.target.value);
                                setErrorCampos(false);
                                setMensaje("");
                            }}
                            className={errorCampos ? "input-error" : ""}
                            disabled={esExitoso || cargando}
                        />
                    </div>

                    {mensaje && (
                        <p style={{
                            color: esExitoso ? "#2e7d32" : "#DE300D",
                            fontSize: "13px",
                            fontWeight: "bold",
                            marginTop: "10px",
                            marginBottom: "15px"
                        }}>
                            {mensaje}
                        </p>
                    )}

                    {esExitoso ? (
                        <button
                            type="button"
                            className="enviar"
                            onClick={() => volverAlLogin(true)} // <-- Pasamos 'true' para avisar del éxito
                        >
                            Ir a Iniciar Sesión
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="enviar"
                            disabled={cargando}
                        >
                            {cargando ? "Guardando..." : "Actualizar Contraseña"}
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
}

export default RestablecerPassword;