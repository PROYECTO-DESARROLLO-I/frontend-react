import "./App.css";
import Usuario from "./forms";
import CrearCuenta from "./CrearCuenta";
import { useState } from "react";

function Inicio() {

  const [vista, setVista] = useState("login");

  return (
    <div className="container">

      {vista === "login" && (
        <Usuario
          irCrearCuenta={() => setVista("crearCuenta")}
        />
      )}

      {vista === "crearCuenta" && (
        <CrearCuenta
          volverLogin={() => setVista("login")}
        />
      )}

    </div>
  );
}

export default Inicio;