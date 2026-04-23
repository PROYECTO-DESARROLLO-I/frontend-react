import "./App.css";
import logo from "./assets/logo.png";
import paciente from "./assets/paciente.png";
import doctor from "./assets/doctor.png";
import admin from "./assets/admin.png";
import sup from "./assets/sup.png";
import Card from "./Card";


function Inicio({irPaciente}) {
  return (
    <div className="container">
      <Card />
    <div className="botones">
      <button className="botonInicio" onClick={irPaciente}>
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
     
    
  );
}

export default Inicio;