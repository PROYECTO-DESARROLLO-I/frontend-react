import { useState } from "react";
import "./App.css";
import { GoArrowLeft } from "react-icons/go";

function RegistroPersonal({ volverAlDashboard }) {
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [identityDocument, setIdentityDocument] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rol, setRol] = useState(""); // "medico" o "administrativo".

    // Estados para campos específicos de Médicos.
    const [especialidad, setEspecialidad] = useState("");
    const [tarjetaProfesional, setTarjetaProfesional] = useState("");

    // Estados para campos específicos de Administrativos.
    const [area, setArea] = useState("");

    const [errores, setErrores] = useState({});
    const [formEnviado, setFormEnviado] = useState(false);
    const [toast, setToast] = useState({ visible: false, mensaje: "", tipo: "" });

    const validarEmail = (correo) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(correo);
    };

    const mostrarToast = (mensaje, tipo) => {
        setToast({ visible: true, mensaje, tipo });
        setTimeout(() => {
            setToast({ visible: false, mensaje: "", tipo: "" });
        }, 4000);
    };

    const manejarRegistro = async (e) => {
        e.preventDefault();
        let nuevosErrores = {};

        if (!nombre.trim()) nuevosErrores.nombre = true;
        if (!apellido.trim()) nuevosErrores.apellido = true;
        if (!identityDocument.trim()) nuevosErrores.identityDocument = true;
        if (!email.trim() || !validarEmail(email)) nuevosErrores.email = true;
        if (!password.trim()) nuevosErrores.password = true;
        if (!rol) nuevosErrores.rol = true;

        // Validaciones dinámicas según el rol.
        if (rol === "medico") {
            if (!especialidad) nuevosErrores.especialidad = true;
            if (!tarjetaProfesional.trim()) nuevosErrores.tarjetaProfesional = true;
        } else if (rol === "administrativo") {
            if (!area) nuevosErrores.area = true;
        }

        // Si hay errores, se guardan y se frena la ejecución.
        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            mostrarToast("Por favor, revisa los campos marcados antes de registrar.", "error");
            return;
        }

        setErrores({});
        setFormEnviado(false);

        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                mostrarToast("No autorizado. Inicia sesión como administrador para registrar usuarios.", "error");
                return;
            }

            if (rol === "medico") {
                const mapaEspecialidades = {
                    "medicina_general": 1,
                    "pediatria": 2,
                    "cardiologia": 3,
                    "ginecologia": 4,
                    "odontologia": 5
                };

                const bodyRequest = {
                    nombre: nombre.trim(),
                    apellido: apellido.trim(),
                    email: email.trim(),
                    password: password,
                    identity_document: identityDocument.trim(),
                    register_number: tarjetaProfesional.trim(),
                    specialty_ids: [mapaEspecialidades[especialidad]]
                };

                const response = await fetch("http://localhost:8000/api/doctors/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(bodyRequest)
                });

                const data = await response.json();

                if (!response.ok) {
                    const campoError = Object.keys(data)[0];
                    const mensajeBackend = data[campoError];
                    mostrarToast(Array.isArray(mensajeBackend) ? mensajeBackend[0] : "Error en el formulario.", "error");
                    return;
                }
            } else if (rol === "administrativo") {
                /* TODO: Consumir endpoint de administrativos en esta parte. */
                mostrarToast("Aún está pendiente el desarrollo del registro de administrativos.", "error");
                return;
            }

            const textoRol = rol === "medico" ? "Médico" : "Administrativo";
            mostrarToast(`¡Registro exitoso! El ${textoRol} ha sido creado correctamente.`, "exito");
            setNombre("");
            setApellido("");
            setEmail("");
            setRol("");
            setEspecialidad("");
            setTarjetaProfesional("");
            setArea("");
            setIdentityDocument("");
            setPassword("");
        } catch (error) {
            mostrarToast("No se pudo conectar con el servidor.", "error");
        }
    };

    const tieneErroresActivos = Object.values(errores).some(valor => valor === true);

    return (
        <div className="admin-form-page">
            {/* INYECCIÓN DE ESTILOS PARA LA PÍLDORA FLOTANTE */}
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
            `}</style>

            {/* COMPONENTE TOAST FLOTANTE DE FEEDBACK */}
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
                <p>Volver al Panel Administrativo</p>
            </div>

            <div className="admin-form-card">
                <h2>Registro de Personal Interno</h2>
                <p style={{ fontSize: "14px", color: "grey", marginBottom: "20px" }}>
                    Inscribe a los nuevos profesionales de la salud y personal de apoyo en la plataforma.
                </p>

                <form onSubmit={manejarRegistro} className="admin-form-grid">
                    Nombres
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => { setNombre(e.target.value); setErrores({...errores, nombre: false}); }}
                        className={errores.nombre ? "input-error" : ""}
                        placeholder="Ej. Carlos Alberto"
                    />

                    Apellidos
                    <input
                        type="text"
                        value={apellido}
                        onChange={(e) => { setApellido(e.target.value); setErrores({...errores, apellido: false}); }}
                        className={errores.apellido ? "input-error" : ""}
                        placeholder="Ej. Pérez Gómez"
                    />

                    Documento de Identidad
                    <input
                        type="text"
                        value={identityDocument}
                        onChange={(e) => { setIdentityDocument(e.target.value); setErrores({...errores, identityDocument: false}); }}
                        className={errores.identityDocument ? "input-error" : ""}
                        placeholder="Ej. 1105326766"
                    />

                    Correo Electrónico Corporativo
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrores({...errores, email: false}); }}
                        className={errores.email ? "input-error" : ""}
                        placeholder="carlos.perez@saludagendax.com"
                    />

                    Contraseña Preliminar
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrores({...errores, password: false}); }}
                        className={errores.password ? "input-error" : ""}
                        placeholder="...."
                    />

                    Rol en la Clínica
                    <select
                        value={rol}
                        onChange={(e) => { setRol(e.target.value); setErrores({}); }}
                        className={errores.rol ? "input-error" : ""}
                        style={{ padding: "10px", borderRadius: "5px", marginBottom: "15px", border: errores.rol ? "1px solid #DE300D" : "1px solid #ccc" }}
                    >
                        <option value="">-- Seleccione un Rol --</option>
                        <option value="medico">Médico / Especialista</option>
                        <option value="administrativo">Personal Administrativo</option>
                    </select>

                    {/* --- CAMPOS DINÁMICOS SEGÚN EL ROL --- */}

                    {/* Formulario de creación de médicos */}
                    {rol === "medico" && (
                        <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "5px" }}>
                            Selector de Especialidad Médica
                            <select
                                value={especialidad}
                                onChange={(e) => { setEspecialidad(e.target.value); setErrores({...errores, especialidad: false}); }}
                                style={{ padding: "10px", borderRadius: "5px", marginBottom: "15px", border: errores.especialidad ? "1px solid #DE300D" : "1px solid #ccc" }}
                            >
                                <option value="">-- Seleccione Especialidad --</option>
                                <option value="medicina_general">Medicina General</option>
                                <option value="pediatria">Pediatría</option>
                                <option value="cardiologia">Cardiología</option>
                                <option value="ginecologia">Ginecología</option>
                                <option value="odontologia">Odontología</option>
                            </select>

                            Número de Tarjeta Profesional
                            <input
                                type="text"
                                value={tarjetaProfesional}
                                onChange={(e) => { setTarjetaProfesional(e.target.value); setErrores({...errores, tarjetaProfesional: false}); }}
                                className={errores.tarjetaProfesional ? "input-error" : ""}
                                placeholder="TP-XXXXXX"
                            />
                        </div>
                    )}

                    {/* Formulario de creación de administrativos */}
                    {rol === "administrativo" && (
                        <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "5px" }}>
                            Área Administrativa
                            <select
                                value={area}
                                onChange={(e) => { setArea(e.target.value); setErrores({...errores, area: false}); }}
                                style={{ padding: "10px", borderRadius: "5px", marginBottom: "15px", border: errores.area ? "1px solid #DE300D" : "1px solid #ccc" }}
                            >
                                <option value="">-- Seleccione el Área --</option>
                                <option value="recepcion">Recepción y Citas</option>
                                <option value="recursos_humanos">Recursos Humanos</option>
                                <option value="facturacion">Facturación y Finanzas</option>
                                <option value="gerencia">Gerencia / Dirección</option>
                            </select>
                        </div>
                    )}

                    {formEnviado && tieneErroresActivos && (
                        <p style={{ color: "#DE300D", fontSize: "13px", fontWeight: "bold", marginTop: "15px" }}>
                            Por favor, rellena correctamente todos los campos marcados.
                        </p>
                    )}

                    <button type="submit" className="admin-primary-button">
                        Registrar Usuario Interno
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RegistroPersonal;
