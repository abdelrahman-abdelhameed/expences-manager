import './StatCard.css';

export default function StatCard({ title, value, icon, trend, color = 'primary' }) {
    return (
        <div className={`stat-card stat-card-${color}`}>
            <div className="stat-card-header">
                <div className="stat-card-icon">{icon}</div>
                <h3 className="stat-card-title">{title}</h3>
            </div>
            <div className="stat-card-body">
                <div className="stat-card-value">{value}</div>
                {trend && (
                    <div className={`stat-card-trend ${trend.direction}`}>
                        {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
                    </div>
                )}
            </div>
        </div>
    );
}
