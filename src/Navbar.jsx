import "./App.css";
import logo from "./assets/logo.png";
function Navbar({ irRegistroPersonal, cerrarSesion,irCrearSede }) {
  return (
    <nav className="navbar">
      
      <img src={logo} alt="logo" />

      <div className="menu">
        <button onClick={irRegistroPersonal}>Registro de personal</button>
        <button>Agendar citas</button>
        <button>Cancelar citas</button>
       <button onClick={irCrearSede}>Crear Sede</button>
        <button onClick={cerrarSesion}>Cerrar Sesion</button>
      </div>
    </nav>
  );
}

export default Navbar;