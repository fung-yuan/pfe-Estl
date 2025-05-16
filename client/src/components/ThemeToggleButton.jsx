import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';

const ThemeToggleButton = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className={`relative flex items-center justify-center p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-300
        ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
      aria-label="Toggle Dark Mode"
    >
      <span
        className={`absolute inset-0 rounded-full transition-transform duration-300
          ${darkMode ? 'translate-x-full' : 'translate-x-0'}
          bg-gradient-to-r from-yellow-400 to-yellow-600`}
      ></span>
      <span className="relative">
        {darkMode ? (
          <SunIcon className="h-5 w-5 text-white" aria-hidden="true" />
        ) : (
          <MoonIcon className="h-5 w-5 text-gray-800" aria-hidden="true" />
        )}
      </span>
    </button>
  );
};

export default ThemeToggleButton;