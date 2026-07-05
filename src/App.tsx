import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { BudgetProvider } from './context/BudgetContext';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import { ForgotPassword } from './pages/Login/ForgotPassword';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Expenses } from './pages/Expenses/Expenses';
import { Budget } from './pages/Budget/Budget';
import { Prediction } from './pages/Prediction/Prediction';
import { Analytics } from './pages/Analytics/Analytics';
import { Reports } from './pages/Reports/Reports';
import { Profile } from './pages/Profile/Profile';
import { Settings } from './pages/Settings/Settings';
import { Admin } from './pages/Admin/Admin';
import { ROUTES } from './lib/routes';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BudgetProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.REGISTER} element={<Register />} />
              <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />

              {/* Private Routes wrapped in layout */}
              <Route element={<AppLayout />}>
                <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                <Route path={ROUTES.EXPENSES} element={<Expenses />} />
                <Route path={ROUTES.BUDGET} element={<Budget />} />
                <Route path={ROUTES.PREDICTION} element={<Prediction />} />
                <Route path={ROUTES.ANALYTICS} element={<Analytics />} />
                <Route path={ROUTES.REPORTS} element={<Reports />} />
                <Route path={ROUTES.PROFILE} element={<Profile />} />
                <Route path={ROUTES.SETTINGS} element={<Settings />} />
                <Route path={ROUTES.ADMIN} element={<Admin />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            </Routes>
          </BrowserRouter>
        </BudgetProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
