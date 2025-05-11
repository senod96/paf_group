import React from 'react';
import { useNavigate } from 'react-router-dom';
import home from './home3.png';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="h-screen bg-cover bg-center flex flex-col items-center justify-end text-white"
      style={{
        backgroundImage: `url(${home})`,
      }}
    >
      <div className="mb-24"> {/* Adjust this value to move it up/down */}
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md shadow-lg transition duration-300"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
