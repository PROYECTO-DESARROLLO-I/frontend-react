import "./App.css";
import logo from "./assets/logo.png";
function Inicio() {
  return (
    <div className="container">
      <div className="card">
        <img src={logo} alt="logo"/>
        <h1>SaludAgendaX</h1>
        <p>Sistema Web de Gestión de Citas Médicas</p>
        <h6>Universidad del Valle - Desarrollo de Software I </h6>

        <div className="botones">
          <button>Paciente</button>
          <button>Doctor</button>
          <button>Administrador</button>
          <button>SuperAdministrador</button>
        </div>
      </div>
    </div>
  );
}

export default Inicio;