import logo from "./assets/logo.png";

function Card() {
  return (
    <div className="card">
      <img src={logo} alt="logo" />
      <h1>SaludAgendaX</h1>
      <p>Sistema Web de Gestión de Citas Médicas</p>
      <h6>Universidad del Valle</h6>
    </div>
  );
}

export default Card;