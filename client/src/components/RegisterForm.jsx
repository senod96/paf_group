import React, { useState } from 'react';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMessage('✅ Registered successfully!');
        setFormData({ name: '', email: '', password: '' });
      } else {
        const err = await res.json();
        setMessage(`❌ Error: ${err.message}`);
      }
    } catch (err) {
      setMessage('❌ Something went wrong!');
    }
  };

  return (
    <div className="dark:bg-gray-900 dark:text-gray-100 min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md animate-fadeIn space-y-5"
      >
        <h2 className="text-3xl font-bold text-center font-[Dancing Script] mb-4">Register</h2>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Name</label>
          <input
            type="text"
            name="name"
            className="appearance-none w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Email</label>
          <input
            type="email"
            name="email"
            className="appearance-none w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Password</label>
          <input
            type="password"
            name="password"
            className="appearance-none w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 transition"
        >
          Register
        </button>

        {message && (
          <p className="text-center text-sm text-gray-700 mt-2">{message}</p>
        )}
      </form>
    </div>
  );
};

export default RegisterForm;
