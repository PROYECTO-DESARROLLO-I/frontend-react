import "./App.css";
import Card from "./Card";
import { GoArrowLeft } from "react-icons/go";

function CrearCuenta({ volverLogin }) {
  return (
    <div className="comp">

      <div className="izq">
        <Card />
      </div>

      <div className="der">

        <div className="atras" onClick={volverLogin}>
          <GoArrowLeft />
          <p>Volver al login</p>
        </div>

        <div className="forms">

          <h2>Crear Cuenta</h2>

          <div className="campos">

            <label>Nombre</label>
            <input type="text" placeholder="Tu nombre" />

            <label>Correo electrónico</label>
            <input type="email" placeholder="usuario@ejemplo.com" />

            <label>Contraseña</label>
            <input type="password" placeholder="••••••••" />

          </div>

          <button className="enviar">
            Registrarse
          </button>

        </div>
      </div>
    </div>
  );
}

export default CrearCuenta;