import "./App.css";

function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <div className="admin-card">
        <span>Personal</span>
        <strong>24</strong>
        <p>Usuarios internos registrados</p>
      </div>

      <div className="admin-card">
        <span>Sedes</span>
        <strong>5</strong>
        <p>Sedes activas</p>
      </div>

      <div className="admin-card">
        <span>Citas</span>
        <strong>128</strong>
        <p>Citas gestionadas este mes</p>
      </div>
    </div>
  );
}

export default AdminDashboard;
