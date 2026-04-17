import "./App.css";
import logo from "./assets/logo.png";
import paciente from "./assets/paciente.png";
import doctor from "./assets/doctor.png";
import admin from "./assets/admin.png";
import sup from "./assets/sup.png";

function Inicio() {
  return (
    <div className="container">
      <div className="card">
        <img src={logo} alt="logo"/>
        <h1>SaludAgendaX</h1>
        <p>Sistema Web de Gestión de Citas Médicas</p>
        <h6>Universidad del Valle - Desarrollo de Software I </h6>

    <div className="botones">
      <button className="botonInicio">
        <img src={paciente} />
        Paciente
        <p>Solicita y gestiona tus citas médicas</p>
      </button>

      <button className="botonInicio">
        <img src={doctor} />
        Doctor
        <p>Consulta tu agenda y disponibilidad</p>
      </button>

      <button className="botonInicio">
        <img src={admin} />
        Administrador
        <p>Gestiona citas, pacientes y médicos</p>
      </button>

      <button className="botonInicio">
        <img src={sup} />
        Superadministrador
        <p>Configura reglas de negocio y parámetros</p>
      </button>
    </div>
              

        </div>
      </div>
    
  );
}

export default Inicio;