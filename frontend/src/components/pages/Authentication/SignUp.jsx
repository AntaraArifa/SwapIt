import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [form, setForm] = useState({
    fullname: '', email: '', phoneNumber: '', password: '', role: 'learner'
  });
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:3000/api/v1/user/register", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) navigate('/signin');
      else alert(data.message);
    } catch (error) {
      alert("Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 shadow-xl rounded-2xl">
        <h2 className="text-3xl font-semibold text-center mb-6">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
          <input name="fullname" value={form.fullname} onChange={handleChange}
            className="w-full border px-4 py-2 rounded" placeholder="Full Name" required />
          <input name="email" type="email" value={form.email} onChange={handleChange}
            className="w-full border px-4 py-2 rounded" placeholder="Email" required />
          <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
            className="w-full border px-4 py-2 rounded" placeholder="Phone Number" required />
          <input name="password" type="password" value={form.password} onChange={handleChange}
            className="w-full border px-4 py-2 rounded" placeholder="Password" required />
          <select name="role" value={form.role} onChange={handleChange}
            className="w-full border px-4 py-2 rounded" required>
            <option value="learner">Learner</option>
            <option value="teacher">Teacher</option>
          </select>
          <input type="file" name="file" onChange={handleFileChange}
            className="w-full border px-4 py-2 rounded" required />
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
