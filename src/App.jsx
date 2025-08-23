import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { LoginForm } from "./components/ui/auth/Login"
import { RegisterForm } from "./components/ui/auth/Register"
import OnboardingForm from "./components/ui/onboarding/Onboarding"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/onboarding" replace/>}/>
        <Route path="/onboarding" element={<OnboardingForm/>} />
        <Route path="/login" element={<LoginForm/>} />
        <Route path="/register" element={<RegisterForm/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
