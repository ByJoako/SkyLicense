import React from "react";
import axios from 'axios';

const DeleteProductModal = ({ product, onClose }) => {
  const token = localStorage.getItem("token");
  
  const handleDelete = async () => {
    try {
        const response = await axios.post('/api/admin/products/delete', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          onClose({
            product,
            text: response.data,
            type: 'success'
          })
        } else {
          onClose({
            text: response.data,
            type: 'error'
          })
        }
      } catch (error) {
        console.error('Error fetching:', error);
        onClose({
            text:'Error',
            type: 'error'
          })
      }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete {product.name}?</p>
        <div className="delete-content">
          <button onClick={handleDelete} className="confirm-button">Confirm</button>
          <button onClick={onClose} className="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;