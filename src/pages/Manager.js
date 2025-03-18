import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Manager.css";
import GeneralTable from "../components/manager/generalTable";
import UserTable from "../components/manager/userTable";
import KeyTable from "../components/manager/keyTable";
import BlacklistTable from "../components/manager/blacklistTable";
import { useAuthContext } from '../components/Auth';
import { Navigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const token = localStorage.getItem('token');
  const { user } = useAuthContext();
  const [privateKey, setPrivateKey] = useState(null);

  // Redirect if user is not authenticated or doesn't have the correct role


  // Fetch private key from backend
  useEffect(() => {
    const fetchPrivateKey = async () => {
      try {
        const response = await axios.get("/api/private-key", {
          headers: { Authorization: `Bearer ${token}` } // Add token to request headers
        });
        
        setPrivateKey(response.data);
      } catch (error) {
        console.error("Error fetching private key:", error.message);
      }
    };
    fetchPrivateKey();
  }, [token]); // Include token as a dependency to re-fetch if it changes

  // Copy private key to clipboard
  const handleCopyKey = () => {
    if (privateKey) {
      navigator.clipboard.writeText(privateKey).then(() => {
        alert("Private key copied!");
      });
    }
  };

  if (!user || (user.role !== 'Admin' && user.role !== 'Owner')) {
      return <Navigate to="/" />;
    }
  return (
    <div className="content">
      <div className="dashboard">
        {/* Quick Actions */}
        <section className="section">
          <div className="section-quick">
          <div>
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/admin/licenses" className="button">Manage Licenses</Link>
            <Link to="/admin/products" className="button">Manage Products</Link>
          </div>
          </div>

        {/* Private Key Section */}
        {privateKey && (
        <div>
          
            <h2>Private Key</h2>
            <div className="private-key">
              <input
                type="text"
                value={`${"*".repeat(privateKey.length)}`} // Display key with masking
                readOnly
                className="private-key-input"
              />
              <button onClick={handleCopyKey} className="copy-button"><i className="fa-regular fa-copy"></i></button>
            </div>
        </div>
        )}
        </div>
        </section>

        <GeneralTable />
        {/* User Management */}
        <UserTable />

        {/* License Requests */}
        <KeyTable />

        {/* Blacklist Management */}
        <BlacklistTable />
      </div>
    </div>
  );
};

export default ManagerDashboard;