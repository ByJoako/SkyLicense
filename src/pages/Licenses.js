import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import './Licenses.css';
import { useAuthContext } from '../components/Auth';

const Licenses = () => {
  const token = localStorage.getItem('token');
  const { user } = useAuthContext();
  const [licenses, setLicenses] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [message, setMessage] = useState(null);
  const [copied, setCopied] = useState(null);

  // Redirect if not authenticated
  

  // Fetch licenses
  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        const response = await axios.get('/api/licenses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLicenses(response.data);
      } catch (error) {
        console.error('Error fetching licenses:', error);
        setMessage({ type: 'error', text: 'Failed to load licenses. Please try again later.' });
      }
    };

    fetchLicenses();
  }, [token]);

  // Handle copying license key
  const handleCopy = (licenseKey) => {
    navigator.clipboard.writeText(licenseKey).then(() => {
      setCopied(licenseKey);
      setMessage({ type: 'success', text: 'License copied to clipboard!' });
      setTimeout(() => {
        setCopied(null);
        setMessage(null);
      }, 2000);
    });
  };

  // Handle actions on licenses
  const handleAction = async (licenseKey, action) => {
    try {
      await axios.post(`/api/licenses/${licenseKey}/${action}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({ type: 'success', text: `Action '${action}' completed successfully.` });
    } catch (error) {
      console.error(`Error performing action '${action}':`, error);
      setMessage({ type: 'error', text: `Failed to perform action '${action}'.` });
    }
  };

  // Toggle dropdown for a specific license
  const toggleDropdown = (licenseKey) => {
    setOpenDropdown(openDropdown === licenseKey ? null : licenseKey);
  };
  if (!user) {
    return <Navigate to="/" />;
  }
  return (
    <div className="licenses-container">
      <h1>My Licenses</h1>

      {/* Floating message notification */}
      {message && <div className={`floating-message ${message.type}`}>{message.text}</div>}

      <div className="licenses-list">
        {licenses.length > 0 ? (
          licenses.map((license) => (
            <div
              key={license.id}
              className={`license-item ${
                license.disabled
                  ? 'disabled'
                  : new Date(license.expires) <= new Date()
                  ? 'expired'
                  : 'active'
              }`}
            >
              <div className="license-header">
                <h3>{license.product}</h3>
                <div>
                  {/* Copy success message */}
                  {copied === license.license_key && <span className="copy-success">Copied!</span>}
                  
                  {/* Copy button */}
                  <button 
                    className="copy-icon" 
                    onClick={() => handleCopy(license.license_key)} 
                    title="Copy License"
                  >
                    <i className="fa-regular fa-copy"></i>
                  </button>
                </div>
              </div>

              <div className="license-details">
                <p><strong>License:</strong> {license.license_key}</p>
                <p><strong>Description:</strong> {license.description}</p>
                <p><strong>Expires:</strong> {new Date(license.expires).toLocaleDateString()}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  {license.disabled
                    ? 'Disabled'
                    : new Date(license.expires) <= new Date()
                    ? 'Expired'
                    : 'Active'}
                </p>
              </div>

              {/* Dropdown Actions */}
              <div className="license-actions">
                <div className="dropdown">
                  <button onClick={() => toggleDropdown(license.license_key)}>Actions</button>
                  {openDropdown === license.license_key && (
                    <ul className="dropdown-menu">
                      <li><button onClick={() => handleAction(license.license_key, 'clearIp')}>Clear IP</button></li>
                      <li><button onClick={() => handleAction(license.license_key, 'clearHwid')}>Clear HWID</button></li>
                      <li><button onClick={() => handleAction(license.license_key, 'resetKey')}>Reset Key</button></li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No licenses found.</p>
        )}
      </div>
    </div>
  );
};

export default Licenses;