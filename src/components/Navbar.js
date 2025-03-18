import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { useAuthContext } from './Auth';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuthContext();
  const isAdmin = user?.role === 'Admin' || user?.role === 'Owner';
  const dropdownRef = useRef(null);

  // Toggle main navigation menu
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Toggle user dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (isMenuOpen) setIsMenuOpen(false);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar-logo">
        <img src="/img/logo.png" alt="Logo" />
        <h1>Sky</h1>
        <h2>Licenses</h2>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="navbar-toggle"
        onClick={toggleMenu}
        aria-expanded={isMenuOpen}
        aria-label="Toggle navigation menu"
      >
        <i className="fa-solid fa-bars"></i>
      </button>

      {/* Navigation Links */}
      <div className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
        <Link to="/" onClick={closeMenu}>Home</Link>
        <Link to="/licenses" onClick={closeMenu}>Licenses</Link>
        <Link to="/products" onClick={closeMenu}>Products</Link>
      </div>

      {/* Auth Section */}
      <div className="navbar-auth">
        {user ? (
          <div className="navbar-user" ref={dropdownRef}>
            <img
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`}
              alt="Profile"
              className="navbar-avatar"
              onClick={toggleDropdown}
            />
            {isDropdownOpen && (
              <div className="navbar-dropdown">
                {isAdmin && (
                <Link to="/manager" onClick={() => setIsDropdownOpen(false)}>Manager</Link>
                )}
                <button onClick={logout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <button 
            className="navbar-signin"
            onClick={() => (window.location.href = '/api/auth/discord')}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;