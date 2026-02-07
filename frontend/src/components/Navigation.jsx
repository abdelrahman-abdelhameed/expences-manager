import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

export default function Navigation() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navigation">
            <div className="nav-brand">
                <h2>💰 Expense Manager</h2>
            </div>

            <div className="nav-content">
                <div className="nav-links">
                    <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
                        📊 Dashboard
                    </NavLink>
                    <NavLink to="/expenses" className={({ isActive }) => isActive ? 'active' : ''}>
                        💵 Daily Expenses
                    </NavLink>
                    <NavLink to="/monthly-plan" className={({ isActive }) => isActive ? 'active' : ''}>
                        📅 Monthly Plan
                    </NavLink>
                    <NavLink to="/categories" className={({ isActive }) => isActive ? 'active' : ''}>
                        🏷️ Categories
                    </NavLink>
                    <NavLink to="/comparison" className={({ isActive }) => isActive ? 'active' : ''}>
                        📈 Comparison
                    </NavLink>
                </div>

                <div className="user-menu">
                    <div className="user-info">
                        <span className="user-name">{user?.name}</span>
                    </div>
                    <button onClick={handleLogout} className="logout-btn" title="Logout">
                        🚪
                    </button>
                </div>
            </div>
        </nav>
    );
}
