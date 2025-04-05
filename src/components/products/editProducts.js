import React, { useState, useRef } from "react";
import { toast } from 'react-toastify';

const EditProductModal = ({ product, onClose }) => {
  const [description, setDescription] = useState(product.description);
  const [image, setImage] = useState(null);
  const [newVersion, setNewVersion] = useState("");
  const [versions, setVersions] = useState(product.versions);
  const [role, setRole] = useState(product.role);
  const [file, setFile] = useState(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem('token');

  const handleRequest = async (url, formData) => {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });
      const data = await res.json();
      console.log(data)
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      return data;
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.message || err);
    }
  };

  const handleAddVersion = async () => {
    if (!newVersion.trim() || !file) {
      return toast.error('Version name or file is missing');
    }

    const formData = new FormData();
    formData.append('productId', product._id);
    formData.append('versionName', newVersion);
    formData.append('versionFile', file);

    await handleRequest('/api/admin/products/edit', formData);
    
    setVersions(prev => [...prev, { value: newVersion, timestamp: Date.now() }]);
    setNewVersion("");
    setFile(null);
  };

  const handleRemoveVersion = async (index) => {
    const formData = new FormData();
    formData.append('productId', product._id);
    formData.append('versionName', versions[index].value);

    await handleRequest('/api/admin/products/edit', formData);
    
    setVersions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('productId', product._id);
    formData.append('description', description);
    formData.append('roleId', role);
    if (image) formData.append('image', image);

    await handleRequest('/api/admin/products/edit', formData);
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>Edit Product</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <label htmlFor="image">Image:</label>
          <input ref={imageInputRef} type="file" accept="image/png" onChange={(e) => setImage(e.target.files[0])} />
          <button type="button" onClick={() => imageInputRef.current.click()}>Upload Image</button>
          {image && <p>Selected: {image.name}</p>}

          <label>Versions:</label>
          <ul>
            {versions.map((version, index) => (
              <li key={index} className="version-item">
                <span>{version.value}</span>
                <button type="button" onClick={() => handleRemoveVersion(index)}>Remove</button>
              </li>
            ))}
          </ul>

          <div className="version-input">
            <input
              type="text"
              value={newVersion}
              placeholder="New version"
              onChange={(e) => setNewVersion(e.target.value)}
            />
            <input ref={fileInputRef} type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button type="button" onClick={() => fileInputRef.current.click()}>Upload File</button>
            <button type="button" onClick={handleAddVersion}>Add Version</button>
          </div>

          <label htmlFor="role">Discord Role:</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>

          <button type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;