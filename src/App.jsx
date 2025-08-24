import { ToastContainer } from 'react-toastify';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Register } from "./components/ui/auth/Register"
import OnboardingForm from "./components/ui/onboarding/Onboarding"
import MainDashboard from "./components/dashboard/MainDashboard"
import ProgressPage from './components/dashboard/Progress';
import Login from './components/ui/auth/Login';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/onboarding" replace/>}/>
        <Route path="/onboarding" element={<OnboardingForm/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/maindashboard" element={<MainDashboard/>}/>
        <Route path="/progress" element={<ProgressPage/>}/>
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </BrowserRouter>
  )
}

export default App
