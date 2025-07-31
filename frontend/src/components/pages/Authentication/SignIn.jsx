"use client"

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setUser } from "../../../redux/authSlice"
import { toast } from "sonner"

const SignIn = () => {
  const [form, setForm] = useState({ email: "", password: "", role: "learner" })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  // Get return URL from location state
  const returnUrl = location.state?.returnUrl || "/"
  const returnState = location.state?.returnState

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("http://localhost:3000/api/v1/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("token", data.token)

        dispatch(setUser(data.user))
        toast.success("Login successful!")

        // Navigate to return URL or home
        if (returnUrl !== "/" && returnState) {
          navigate(returnUrl, { state: returnState })
        } else {
          navigate(returnUrl)
        }
      } else {
        toast.error(data.message || "Login failed!")
      }
    } catch (err) {
      console.error("Login error:", err)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 shadow-xl rounded-2xl">
        <h2 className="text-3xl font-semibold text-center mb-6">Sign In</h2>

        {/* Show message if redirected from rating page */}
        {location.state?.returnUrl?.includes("rate-session") && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">Please sign in to rate and review your session.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Email"
            required
            disabled={isLoading}
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Password"
            required
            disabled={isLoading}
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
            disabled={isLoading}
          >
            <option value="learner">Learner</option>
            <option value="teacher">Teacher</option>
          </select>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Signing In...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-600 hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignIn
