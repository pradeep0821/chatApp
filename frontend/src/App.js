
import './App.css';
import { Route, Routes } from "react-router-dom";
import SignupPage from './authPages/signupPage';
import LandingPage from './Pages/landingPage';
import LoginPage from './authPages/loginPage';
import DashboardPage from './Pages/dashboard';


function App() {

  return (
    <>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </>


  );
}

export default App;
