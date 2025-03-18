import React, { useState, useRef } from "react";

const EditProductModal = ({ product, onClose }) => {
  const [description, setDescription] = useState(product.description);
  const [image, setImage] = useState(null);
  const [newVersion, setNewVersion] = useState("");
  const [versions, setVersions] = useState(product.versions);
  const [role, setRole] = useState(product.role);
  const [file, setFile] = useState(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const handleAddVersion = () => {
    if (newVersion.trim()) {
      setVersions([...versions, newVersion.trim()]);
      setNewVersion("");
    }
  };

  const handleRemoveVersion = (index) => {
    setVersions(versions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      description,
      image,
      versions,
      role,
    };
    console.log(formData);
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>
          &times;
        </span>
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
                    <input ref={imageInputRef} id="image" type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/png" required />
          <button type="button" className="upload-button" onClick={() => imageInputRef.current.click()}>
            Upload Image
          </button>
          {image && <p>Selected: {image.name}</p>}
          

          <label>Versions:</label>
          <ul>
            {versions.map((version, index) => (
              <li key={index} className="version-item">
                <span>{version}</span>
                <button
                  type="button"
                  className="delete-version-btn"
                  onClick={() => handleRemoveVersion(index)}
                >
                  Remove
                </button>
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
          <input ref={fileInputRef} id="file" type="file" onChange={(e) => setFile(e.target.files[0])} required />
          <button type="button" className="upload-button" onClick={() => fileInputRef.current.click()}>
            Upload file
          </button>
            <button type="button" onClick={handleAddVersion}>
              Add Version
            </button>
          </div>

          <label htmlFor="role">Discord Role:</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>

          <button type="submit" className="submit-button">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;