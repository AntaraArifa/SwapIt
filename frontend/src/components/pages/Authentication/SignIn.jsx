import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignIn = () => {
  const [form, setForm] = useState({ email: '', password: '', role: 'learner' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/v1/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) navigate('/');
      else alert(data.message);
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 shadow-xl rounded-2xl">
        <h2 className="text-3xl font-semibold text-center mb-6">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input 
            name="email" 
            type="email" 
            value={form.email} 
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded" 
            placeholder="Email" 
            required 
          />
          <input 
            name="password" 
            type="password" 
            value={form.password} 
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded" 
            placeholder="Password" 
            required 
          />
          <select 
            name="role" 
            value={form.role} 
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded" 
            required
          >
            <option value="learner">Learner</option>
            <option value="teacher">Teacher</option>
          </select>
          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            Login
          </button>
        </form>

        {/* Updated Register Prompt */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-indigo-600 hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
