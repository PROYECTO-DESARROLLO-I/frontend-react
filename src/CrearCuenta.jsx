import "./App.css";
import Card from "./Card";
import { GoArrowLeft } from "react-icons/go";
import { useState } from "react";

function CrearCuenta({ volverLogin }) {
    const [fecha, setFecha] = useState("");
    const [documento, setDocumento] = useState("");
  return (
    <div className="comp">

      <div className="izq">
        <Card />
      </div>

      <div className="der">

        <div className="forms">

          <div className="atras" onClick={volverLogin}>
              <GoArrowLeft />
              <p>Volver al login</p>
          </div>

          <h2>Crear Cuenta</h2>

          <div className="campos">

            <label>Nombre</label>
            <input type="text" placeholder="Tu nombre" />

            <label>Correo electrónico</label>
            <input type="email" placeholder="usuario@ejemplo.com" />

            <label>Contraseña</label>
            <input type="password" placeholder="••••••••" />

            <label>Tipo de documento</label>
            <select>
                <option value="">Selecciona un tipo de documento</option>
                <option value="cc">Cédula de Ciudadanía</option>
                <option value="ce">Cédula de Extranjería</option>
                <option value="ti">Tarjeta de Identidad</option>
                <option value="pasaporte">Pasaporte</option>
                <option value="PPT">PPT</option>
                <option value="PEP">PEP</option>
            </select>

            <label>Número de documento</label>
            <input type="text" placeholder="12679436" maxLength={10} value={documento} onChange={(e) => {
                setDocumento(e.target.value.replace(/[^0-9]/g, ""));
            }}/>

            <label>Fecha de nacimiento</label>
            <input type="date" value={fecha} onChange={(e)=> setFecha(e.target.value)} max={new Date().toISOString().split("T")[0]} />

            <label>Numero de telefono</label>
            <input type="text" placeholder="315487652" maxLength={10}/>

            <label>Dirección</label>
            <input type="text" placeholder="cl 33f #34-15" />

            <label>EPS</label>
            <select>
                <option value="">Selecciona un tipo EPS</option>
                </select>
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