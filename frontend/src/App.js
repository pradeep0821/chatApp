
import { ThemeProvider as ThemeContextProvider } from './context/ThemeContext';
import './App.css';
import { Route, Routes } from "react-router-dom";
import SignupPage from './authPages/signupPage';
import LandingPage from './Pages/landingPage';
import LoginPage from './authPages/loginPage';
import DashboardPage from './Pages/dashboard';
import ProfilePage from './Pages/profile';
import SettingsPage from './Pages/settings';

function App() {

  return (
    <ThemeContextProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </ThemeContextProvider>
  );
}

export default App;
