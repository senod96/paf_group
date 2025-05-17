import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'; // ✅ Correct way

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setStatus('Logging in...');

  // ✅ Admin credentials check before API call
  if (formData.email === 'admin@gmail.com' && formData.password === 'admin') {
    navigate('/admin');
    return;
  }

  try {
    const res = await fetch('http://localhost:8080/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('user', data.id); 
      setStatus('✅ Logged in successfully!');
      navigate('/dashboard');
    } else {
      setStatus(`❌ ${data.message || 'Login failed'}`);
    }
  } catch (err) {
    console.error('Login error:', err);
    setStatus('❌ Something went wrong');
  }
};

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential); // ✅ fixed
      const googleUser = {
        name: decoded.name,
        email: decoded.email,
        profilePicture: decoded.picture,
      };

      const res = await fetch('http://localhost:8080/api/users/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleUser),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', data.id);
        navigate('/dashboard');
      } else {
        setStatus(`❌ ${data.message || 'Google login failed'}`);
      }
    } catch (err) {
      console.error('Google login failed', err);
      setStatus('❌ Google login failed');
    }
  };

  return (
    <div className="dark:bg-gray-900 dark:text-gray-100 min-h-screen bg-gray-100 flex justify-center items-center px-4">
      <div className="dark:bg-gray-900 dark:text-gray-100 bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center text-blue-700">Skillora Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <div className="dark:bg-gray-900 dark:text-gray-100 text-center text-sm text-gray-500">or</div>

        <div className="dark:bg-gray-900 dark:text-gray-100 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setStatus('❌ Google login failed')}
          />
        </div>

        {status && <p className="text-center text-sm text-gray-700 mt-2">{status}</p>}

        <div className="dark:bg-gray-900 dark:text-gray-100 text-center mt-4">
          <span className="text-sm text-gray-600">Don't have an account? </span>
          <button
            onClick={() => navigate('/register')}
            className="text-blue-600 hover:underline text-sm"
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
