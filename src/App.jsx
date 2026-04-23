import Inicio from "./inicio";
import Paciente from "./forms";
import { useState } from "react";

function App() {
  const [vista, setVista] = useState("inicio");

  return (
    <>
      {vista === "inicio" && (
        <Inicio irPaciente={() => setVista("paciente")} />
      )}

      {vista === "paciente" && (
        <Paciente volverInicio={() => setVista("inicio")} />
      )}
    </>
  );
}

export default App;