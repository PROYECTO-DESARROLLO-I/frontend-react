import { useState, useEffect } from "react";
import "./App.css";
import { GoArrowLeft } from "react-icons/go";

function PerfilPaciente({ volverAlDashboard }) {
    const [datosPaciente] = useState(null);
    const [tipoDocumento, setTipoDocumento] = useState("");
    const [cedula, setCedula] = useState("");
    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");
    const [email, setEmail] = useState("");
    const [eps, setEps] = useState("");

    const [modoEdicion, setModoEdicion] = useState(false);

    const [errores, setErrores] = useState({});

    const [toast, setToast] = useState({ visible: false, mensaje: "", tipo: "" });

    useEffect(() => {
        const cargarDatos = async () => {
            const token = localStorage.getItem('accessToken'); // Siempre usamos accessToken

            if (!token) {
                mostrarToast("No has iniciado sesión", "error");
                return;
            }

            try {
                const response = await fetch("http://localhost:8000/api/patients/me/", {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Mapeo correcto según los datos que recibimos del backend
                    setNombre(data.full_name || "");
                    setCedula(data.identity_document || "");
                    setTelefono(data.phone_number || "");
                    setEmail(data.email || "");
                    setEps(data.eps || "");
                    setTipoDocumento(data.tipo_documento || "No especificado");
                }
            } catch (error) {
                mostrarToast("Error conectando al servidor", "error");
            }
        };
        cargarDatos().catch(console.error);
    }, []);

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

    const guardarCambios = async (e) => {
        e.preventDefault();

        if (errores.telefono || errores.email || !telefono.trim() || !email.trim()) {
            mostrarToast("Por favor, corrige los errores antes de guardar.", "error");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/patients/me/", {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                    // CAMBIO AQUÍ: usamos accessToken en lugar de 'token'
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                // Asegúrate que estos nombres coincidan con los que espera tu backend (PATCH)
                body: JSON.stringify({
                    email: email,
                    phone_number: telefono // Usamos phone_number porque el back lo recibe así
                })
            });

            if (response.ok) {
                setModoEdicion(false);
                mostrarToast("Perfil actualizado correctamente", "exito");
            } else {
                const errorData = await response.json();
                mostrarToast(errorData.detail || "Error al actualizar perfil", "error");
            }
        } catch (error) {
            mostrarToast("Error de conexión con el servidor", "error");
        }
    };

    const cancelarEdicion = () => {
        if (datosPaciente) {
            setTelefono(datosPaciente.telefono);
            setEmail(datosPaciente.email);
        }

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
                    <input type="text" value={tipoDocumento} disabled style={{ backgroundColor: "#f5f5f5" }} />

                    <label>Número de Documento</label>
                    <input type="text" value={cedula} disabled style={{ backgroundColor: "#f5f5f5" }} />

                    <label>Nombre Completo</label>
                    <input type="text" value={nombre} disabled style={{ backgroundColor: "#f5f5f5" }} />

                    <label>Número de Teléfono</label>
                    <input type="text" value={telefono} onChange={manejarCambioTelefono} disabled={!modoEdicion} />

                    <label>Correo Electrónico</label>
                    <input type="email" value={email} onChange={manejarCambioEmail} disabled={!modoEdicion} />

                    <label>EPS</label>
                    <input type="text" value={eps} disabled style={{ backgroundColor: "#f5f5f5" }} />

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