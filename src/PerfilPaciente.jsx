import { useState } from "react";
import "./App.css";
import { GoArrowLeft } from "react-icons/go";

function PerfilPaciente({ volverAlDashboard }) {
    // Datos iniciales simulados del Paciente (Simulación de BD)
    const [datosPaciente, setDatosPaciente] = useState({
        tipoDocumento: "Cédula de Ciudadanía",
        nombre: "David Taborda",
        cedula: "123456789",
        telefono: "3157654321",
        email: "david.paciente@ejemplo.com"
    });

    const [tipoDocumento, setTipoDocumento] = useState(datosPaciente.tipoDocumento);
    const [cedula, setCedula] = useState(datosPaciente.cedula);
    const [nombre, setNombre] = useState(datosPaciente.nombre);
    const [telefono, setTelefono] = useState(datosPaciente.telefono);
    const [email, setEmail] = useState(datosPaciente.email);

    const [modoEdicion, setModoEdicion] = useState(false);

    const [errores, setErrores] = useState({});

    const [toast, setToast] = useState({ visible: false, mensaje: "", tipo: "" });

    const mostrarToast = (mensaje, tipo) => {
        setToast({ visible: true, mensaje, tipo });
        setTimeout(() => {
            setToast({ visible: false, mensaje: "", tipo: "" });
        }, 4000);
    };

    const validarEmail = (correo) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(correo);
    };

    const manejarCambioTelefono = (e) => {
        const valor = e.target.value.replace(/[^0-9]/g, "");
        setTelefono(valor);
        if (valor.trim().length < 7) {
            setErrores(prev => ({ ...prev, telefono: "El teléfono debe tener mínimo 7 dígitos." }));
        } else {
            setErrores(prev => ({ ...prev, telefono: null }));
        }
    };

    const manejarCambioEmail = (e) => {
        const valor = e.target.value;
        setEmail(valor);
        if (!validarEmail(valor)) {
            setErrores(prev => ({ ...prev, email: "Formato de correo electrónico inválido." }));
        } else {
            setErrores(prev => ({ ...prev, email: null }));
        }
    };

    const esDocumentoBloqueado = () => {
        const original = datosPaciente.tipoDocumento;
        const nuevo = tipoDocumento;

        return original === nuevo ||
            (original === "Tarjeta de Identidad" && nuevo === "Cédula de Ciudadanía") ||
            (original === "Cédula de Ciudadanía" && nuevo === "Tarjeta de Identidad");
    };

    const manejarCambioTipoDocumento = (e) => {
        const nuevoTipo = e.target.value;
        setTipoDocumento(nuevoTipo);

        if (
            (datosPaciente.tipoDocumento === "Tarjeta de Identidad" && nuevoTipo === "Cédula de Ciudadanía") ||
            (datosPaciente.tipoDocumento === "Cédula de Ciudadanía" && nuevoTipo === "Tarjeta de Identidad") ||
            (datosPaciente.tipoDocumento === nuevoTipo)
        ) {
            setCedula(datosPaciente.cedula);
        }
    };

    const guardarCambios = (e) => {
        e.preventDefault();

        if (errores.telefono || errores.email || !nombre.trim() || !telefono.trim() || !email.trim() || !cedula.trim()) {
            mostrarToast("Por favor, corrige los errores antes de guardar.", "error");
            return;
        }

        setDatosPaciente({
            tipoDocumento: tipoDocumento,
            cedula: cedula,
            nombre: nombre,
            telefono: telefono,
            email: email
        });

        setModoEdicion(false);
        mostrarToast("¡Perfil actualizado con éxito!", "exito");
    };

    const cancelarEdicion = () => {
        setTipoDocumento(datosPaciente.tipoDocumento);
        setCedula(datosPaciente.cedula);
        setNombre(datosPaciente.nombre);
        setTelefono(datosPaciente.telefono);
        setEmail(datosPaciente.email);
        setErrores({});
        setModoEdicion(false);
    };

    return (
        <div className="admin-form-page">

            {/* INYECCIÓN LOCAL DE ANIMACIONES */}
            <style>{`
                @keyframes fadeInToast {
                    from { opacity: 0; transform: translateY(-15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeOutToast {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(-15px); }
                }
                .toast-animado {
                    position: fixed;
                    top: 30px;
                    right: 30px;
                    color: white;
                    padding: 14px 28px;
                    border-radius: 50px;
                    box-shadow: 0px 5px 15px rgba(0,0,0,0.25);
                    z-index: 99999;
                    font-weight: bold;
                    font-size: 14px;
                    white-space: nowrap;
                    pointer-events: none;
                    opacity: 0;
                    visibility: hidden;
                    transition: visibility 0.4s;
                }
                .toast-animado.entrar {
                    visibility: visible;
                    animation: fadeInToast 0.4s ease-in-out forwards;
                }
                .toast-animado.salir {
                    visibility: visible;
                    animation: fadeOutToast 0.4s ease-in-out forwards;
                }

                .select-perfil { 
                    width: 100%; 
                    padding: 8px 10px;
                    border: 1px solid #ccc; 
                    border-radius: 5px; 
                    background-color: white; 
                    font-size: 14px; 
                    box-sizing: border-box;
                    margin: 0;
                    display: block;
                    line-height: 1.2;
                }
                
                .select-perfil:disabled { 
                    background-color: #f5f5f5; 
                    color: #888; 
                    cursor: not-allowed; 
                }
    
                .admin-form-grid input {
                    height: 38px;
                    box-sizing: border-box;
                }

                .contenedor-botones-perfil {
                    grid-column: 2;
                    display: flex;
                    justify-content: flex-start;
                    margin-top: 10px;
                    width: 100%;
                }
            `}</style>

            {/* TOAST FLOTANTE CON TRANSICIÓN EN DOS TIEMPOS */}
            <div
                className={`toast-animado ${toast.visible ? "entrar" : (toast.mensaje ? "salir" : "")}`}
                style={{
                    backgroundColor: toast.tipo === "exito" ? "#2e7d32" : "#DE300D"
                }}
            >
                {toast.mensaje}
            </div>

            <div className="admin-back" onClick={volverAlDashboard}>
                <GoArrowLeft />
                <p>Volver al Panel de Paciente</p>
            </div>

            <div className="admin-form-card">
                <h2>Mi Perfil - SaludAgendaX</h2>
                <p style={{ fontSize: "14px", color: "grey", marginBottom: "30px" }}>
                    Mantén tus datos de contacto actualizados para garantizar la correcta asignación de citas y notificaciones.
                </p>

                <form onSubmit={guardarCambios} className="admin-form-grid">
                    <label>Tipo de Documento</label>
                    <select
                        className="select-perfil"
                        value={tipoDocumento}
                        onChange={manejarCambioTipoDocumento}
                        disabled={!modoEdicion}
                    >
                        <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                        <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                        <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
                        <option value="Pasaporte">Pasaporte</option>
                        <option value="PPT">PPT</option>
                        <option value="PEP">PEP</option>
                    </select>

                    <label>Número de Documento</label>
                    <div style={{ width: "100%" }}>
                        <input
                            type="text"
                            value={cedula}
                            onChange={(e) => setCedula(e.target.value)}
                            disabled={!modoEdicion || esDocumentoBloqueado()}
                            style={{
                                backgroundColor: (!modoEdicion || esDocumentoBloqueado()) ? "#f5f5f5" : "#fff",
                                color: (!modoEdicion || esDocumentoBloqueado()) ? "#888" : "#000",
                                cursor: (!modoEdicion || esDocumentoBloqueado()) ? "not-allowed" : "text"
                            }}
                            required
                        />
                    </div>

                    <label>Nombre Completo</label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        disabled={!modoEdicion}
                        style={{ backgroundColor: modoEdicion ? "#fff" : "#f5f5f5" }}
                        required
                    />

                    <label>Número de Teléfono</label>
                    <div style={{ width: "100%" }}>
                        <input
                            type="text"
                            value={telefono}
                            onChange={manejarCambioTelefono}
                            disabled={!modoEdicion}
                            className={errores.telefono && modoEdicion ? "input-error" : ""}
                            style={{ backgroundColor: modoEdicion ? "#fff" : "f5f5f5" }}
                            required
                        />
                        {errores.telefono && modoEdicion && (
                            <span style={{ color: "#DE300D", fontSize: "12px", marginTop: "5px", display: "block" }}>
                                    {errores.telefono}
                            </span>
                        )}
                    </div>

                    <label>Correo Electrónico</label>
                    <div style={{ width: "100%" }}>
                        <input
                            type="email"
                            value={email}
                            onChange={manejarCambioEmail}
                            disabled={!modoEdicion}
                            className={errores.email && modoEdicion ? "input-error" : ""}
                            style={{ backgroundColor: modoEdicion ? "#fff" : "f5f5f5" }}
                            required
                        />
                        {errores.email && modoEdicion && (
                            <span style={{ color: "#DE300D", fontSize: "12px", marginTop: "5px", display: "block" }}>
                                    {errores.email}
                            </span>
                        )}
                    </div>

                    <div className="contenedor-botones-perfil">
                        {!modoEdicion ? (
                            <button
                                type="button"
                                className="admin-primary-button"
                                onClick={() => setModoEdicion(true)}
                                style={{ margin: 0, width: "auto", padding: "10px 30px" }}
                            >
                                Editar Perfil
                            </button>
                        ) : (
                            <div style={{ display: "flex", gap: "15px", width: "100%" }}>
                                <button type="submit" className="admin-primary-button" style={{ flex: 1 }}>
                                    Guardar Cambios
                                </button>

                                <button
                                    type="button"
                                    onClick={cancelarEdicion}
                                    className="admin-primary-button"
                                    style={{
                                        flex: 1,
                                        backgroundColor: "white",
                                        color: "#DE300D",
                                        border: "2px solid #DE300D"
                                    }}
                                >
                                    Cancelar

                                </button>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PerfilPaciente;