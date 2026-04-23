import "./App.css";
import paciente from "./assets/paciente.png";
import Card from "./Card";
import { GoArrowLeft } from "react-icons/go";
function Paciente(){
    return(
    <div className="comp">
        <div className="izq">
            <Card />
        </div>

        <div className="der">
        <div className="atras">
            <GoArrowLeft />
            <p>Cambiar tipo de usuario</p>
        </div>
        

        <div className="forms">
            <img src={paciente} />
                Paciente
                <p>Solicita y gestiona tus citas médicas</p>
            
            <div className="campos">
                Correo electrónico
                <input type="email" placeholder="usuario@ejemplo.com" />
            Contraseña
            <input type="password" placeholder="...." />
            </div>
            

            <button className="enviar">
                Iniciar sesion
                </button>
        </div>
        </div>
       
    </div>
        
    );
    
}

export default Paciente;