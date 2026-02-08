import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import DailyExpenses from './pages/DailyExpenses';
import MonthlyPlan from './pages/MonthlyPlan';
import Categories from './pages/Categories';
import BankAccounts from './pages/BankAccounts';
import MonthComparison from './pages/MonthComparison';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route path="/*" element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/expenses" element={<DailyExpenses />} />
                      <Route path="/monthly-plan" element={<MonthlyPlan />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/bank-accounts" element={<BankAccounts />} />
                      <Route path="/comparison" element={<MonthComparison />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
