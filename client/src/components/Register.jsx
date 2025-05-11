import React, { useState } from 'react';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    education: [
      {
        degree: '',
        institution: '',
        startDate: '',
        endDate: ''
      }
    ]
  });

  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...form.education];
    updated[index][field] = value;
    setForm({ ...form, education: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Registering...');

    if (form.password !== form.confirmPassword) {
      return setStatus('❌ Passwords do not match.');
    }

    try {
      const res = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          mobile: form.mobile,
          isVerified: false,
          education: form.education
        })
      });

      if (res.ok) {
        setStatus('✅ Registration successful! Please check your email to verify your account.');
        setForm({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          mobile: '',
          education: [{ degree: '', institution: '', startDate: '', endDate: '' }]
        });
      } else {
        const err = await res.json();
        setStatus(`❌ ${err.message || 'Registration failed'}`);
      }
    } catch (err) {
      setStatus('❌ Something went wrong.');
    }
  };

  return (
    <div className="dark:bg-gray-900 dark:text-gray-100 min-h-screen flex items-center justify-center bg-gray-50 font-inter p-4">
      <form onSubmit={handleSubmit} className="bg-white shadow-md p-8 rounded-lg w-full max-w-lg space-y-4">
        <h2 className="text-xl font-bold text-center text-blue-600">Create your account</h2>

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full border border-gray-300 rounded-md px-4 py-2"
          required
        />

        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full border border-gray-300 rounded-md px-4 py-2"
          required
        />

        <input
          name="mobile"
          type="tel"
          value={form.mobile}
          onChange={handleChange}
          placeholder="Mobile Number"
          className="w-full border border-gray-300 rounded-md px-4 py-2"
        />

        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full border border-gray-300 rounded-md px-4 py-2"
          required
        />

        <input
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm Password"
          className="w-full border border-gray-300 rounded-md px-4 py-2"
          required
        />

        <div className="dark:bg-gray-900 dark:text-gray-100 pt-2">
          <label className="block font-medium text-gray-700 mb-2">Education</label>
          {form.education.map((edu, idx) => (
            <div key={idx} className="space-y-2 mb-4">
              <input
                placeholder="Degree"
                value={edu.degree}
                onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                placeholder="Institution"
                value={edu.institution}
                onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <div className="dark:bg-gray-900 dark:text-gray-100 flex gap-2">
                <input
                  type="date"
                  value={edu.startDate}
                  onChange={(e) => handleEducationChange(idx, 'startDate', e.target.value)}
                  className="w-1/2 border border-gray-300 rounded-md px-3 py-2"
                />
                <input
                  type="date"
                  value={edu.endDate}
                  onChange={(e) => handleEducationChange(idx, 'endDate', e.target.value)}
                  className="w-1/2 border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Register
        </button>

        {status && <p className="text-sm text-center text-gray-600 mt-2">{status}</p>}
      </form>
    </div>
  );
};

export default Register;
