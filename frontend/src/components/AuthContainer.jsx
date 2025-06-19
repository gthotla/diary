"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Login from "../pages/Login"
import Signup from "../pages/Signup"

export default function AuthContainer() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)

  useEffect(() => {
    // Set initial state based on current path
    if (location.pathname === "/signup") {
      setIsLogin(false)
    } else {
      setIsLogin(true)
    }
  }, [location.pathname])

  const handleSwitchToSignup = () => {
    setIsLogin(false)
    navigate("/signup")
  }

  const handleSwitchToLogin = () => {
    setIsLogin(true)
    navigate("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      {isLogin ? <Login onSignupClick={handleSwitchToSignup} /> : <Signup onLoginClick={handleSwitchToLogin} />}
    </div>
  )
}
