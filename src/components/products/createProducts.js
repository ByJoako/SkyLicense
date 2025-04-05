import React, { useState, useRef } from "react";
import { toast } from 'react-toastify';

const CreateProductModal = ({ onClose }) => {
  const [roles, setRoles] = useState([
    'tets']);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [version, setVersion] = useState("");
  const [role, setRole] = useState("");

  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const handleSubmit = async (e) => {
    try {
    e.preventDefault();
console.log('1')
    if (!image || !file) {
      alert("Please select an image and a file before submitting.");
      return;
    }

    const token = localStorage.getItem('token');
    
    const formdata = new FormData();
    formdata.append('name', name);
    formdata.append('description', description);
    formdata.append('image', image);
    formdata.append('file', file);
    formdata.append('versionName', version);
    formdata.append('roleId', role);
    console.log('2')
    const res = await fetch('/api/admin/products/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formdata
    });
    console.log(res)
    const data = await res.json();
    console.log(data)
    if (!res.ok) {
          throw new Error(data.message);
        } else {
    toast.success(data.message);
        
        onClose({
          name, description, image 
        });
        }
      
    } catch(err) {
      toast.error(err.message || err);
      console.error(err);
    }
  };
  
  const close = () => {
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={close}>&times;</span>
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
