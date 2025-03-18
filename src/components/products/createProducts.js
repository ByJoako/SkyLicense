import React, { useState, useRef, useEffect } from "react";

const CreateProductModal = ({ onClose }) => {
  const [roles, setRoles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [version, setVersion] = useState("");
  const [role, setRole] = useState("");

  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    
  }, []);
  
  
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!image || !file) {
      alert("Please select an image and a file before submitting.");
      return;
    }

    console.log({ name, description, image, file, version, role });
    onClose({
      name, description, image, file, version, role 
    });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>Create Product</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Name:</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />

          <label htmlFor="description">Description:</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />

          <label htmlFor="addProductImage">Image:</label>
          <input ref={imageInputRef} id="addProductImage" type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/png" required />
          <button type="button" className="upload-button" onClick={() => imageInputRef.current.click()}>
            Upload Image
          </button>
          {image && <p>Selected: {image.name}</p>}

          <label htmlFor="addProductFile">File:</label>
          <input ref={fileInputRef} id="addProductFile" type="file" onChange={(e) => setFile(e.target.files[0])} required />
          <button type="button" className="upload-button" onClick={() => fileInputRef.current.click()}>
            Upload File
          </button>
          {file && <p>Selected: {file.name}</p>}

          <label htmlFor="version">Version:</label>
          <input id="version" type="text" value={version} onChange={(e) => setVersion(e.target.value)} required />

          <label htmlFor="role">Discord Role:</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="" disabled>Select role</option>
            {roles.map(rol => (
                        <option value={rol}>{rol}</option>))}
          </select>

          <button type="submit">Create</button>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;