import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            FundFlow
          </Link>

          <nav className="hidden md:flex space-x-6">
            <Link to="/campaigns" className="text-gray-700 hover:text-blue-600">
              Browse Campaigns
            </Link>
            {user && user.role === 'creator' && (
              <Link to="/create-campaign" className="text-gray-700 hover:text-blue-600">
                Start a Campaign
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link to="/admin-panel" className="text-gray-700 hover:text-blue-600">
                Admin Panel
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2">
                    <img
                      src={user.profilePic || '/default-avatar.png'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t">
            <nav className="flex flex-col space-y-3">
              <Link to="/campaigns" className="text-gray-700 hover:text-blue-600">
                Browse Campaigns
              </Link>
              {user && user.role === 'creator' && (
                <Link to="/create-campaign" className="text-gray-700 hover:text-blue-600">
                  Start a Campaign
                </Link>
              )}
              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <Link to="/admin-panel" className="text-gray-700 hover:text-blue-600">
                      Admin Panel
                    </Link>
                  ) : (
                    <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
                      Dashboard
                    </Link>
                  )}
                  <Link to="/profile" className="text-gray-700 hover:text-blue-600">
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-gray-700 hover:text-blue-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex space-x-2">
                  <Link
                    to="/login"
                    className="flex-1 px-4 py-2 text-center text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 px-4 py-2 text-center bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;