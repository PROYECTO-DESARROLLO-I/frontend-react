import { useState, useEffect } from "react";
import { API_URL } from "./apiConfig";
import "./App.css";
import { GoEye, GoEyeClosed } from "react-icons/go"; // <-- IMPORTACIÓN DE ICONOS

function RestablecerPassword({ volverAlLogin }) {
    const [nuevaPassword, setNuevaPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");
    const [uid, setUid] = useState("");
    const [token, setToken] = useState("");

    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [esExitoso, setEsExitoso] = useState(false);
    const [errorCampos, setErrorCampos] = useState(false);

    // NUEVOS ESTADOS: Control visual de contraseñas independientes
    const [mostrarNuevaPassword, setMostrarNuevaPassword] = useState(false);
    const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);

        let rawUid = queryParams.get("uid") || "";
        let rawToken = queryParams.get("token") || "";

        // LIMPIEZA TOTAL:
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
            uid: uid,
            token: token,
            new_password: nuevaPassword,
            confirm_password: confirmarPassword,
        };

        try {
            const response = await fetch(`${API_URL}/api/auth/password-reset/confirm/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const respuestaTexto = await response.text();
            let data = {};
            try {
                data = JSON.parse(respuestaTexto);
            } catch (e) {
                // No era JSON
            }

            if (!response.ok) {
                setErrorCampos(true);
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

                    {/* CAMPO 1: NUEVA CONTRASEÑA CON OJO */}
                    <div className="campos" style={{ width: "100%", marginBottom: "15px" }}>
                        Nueva Contraseña
                        <div className="password-input-wrap">
                            <input
                                type={mostrarNuevaPassword ? "text" : "password"}
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
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setMostrarNuevaPassword((valor) => !valor)}
                                aria-label={mostrarNuevaPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                title={mostrarNuevaPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                disabled={esExitoso || cargando}
                            >
                                {mostrarNuevaPassword ? <GoEyeClosed /> : <GoEye />}
                            </button>
                        </div>
                    </div>

                    {/* CAMPO 2: CONFIRMAR CONTRASEÑA CON OJO */}
                    <div className="campos" style={{ width: "100%", marginBottom: "15px" }}>
                        Confirmar Contraseña
                        <div className="password-input-wrap">
                            <input
                                type={mostrarConfirmarPassword ? "text" : "password"}
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
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setMostrarConfirmarPassword((valor) => !valor)}
                                aria-label={mostrarConfirmarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                title={mostrarConfirmarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                disabled={esExitoso || cargando}
                            >
                                {mostrarConfirmarPassword ? <GoEyeClosed /> : <GoEye />}
                            </button>
                        </div>
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
                            onClick={() => volverAlLogin(true)}
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