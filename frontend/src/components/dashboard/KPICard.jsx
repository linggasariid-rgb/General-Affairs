export default function KPICard({ title, value, icon, color = 'primary', change, onClick }) {
  return (
    <div className="card shadow-sm h-100" style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <small className="text-muted text-uppercase fw-bold" style={{ fontSize: '11px' }}>{title}</small>
          <i className={`bi ${icon} text-${color} fs-4`}></i>
        </div>
        <h4 className="mb-1 fw-bold">{value}</h4>
        {change && <small className={`text-${color}`}>{change}</small>}
      </div>
    </div>
  );
}
