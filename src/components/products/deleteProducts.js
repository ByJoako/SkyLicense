import React from "react";
import { toast } from 'react-toastify';

const DeleteProductModal = ({ product, onClose }) => {
  const token = localStorage.getItem("token");
  
  const handleDelete = async () => {
    fetch('/api/admin/products/delete', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId: product._id }),
    }).then(res => {
      res.json().then(data => {
        if (!res.ok) {
        throw new Error(data.message);
      }
      toast.success(data.message);
      onClose(true);
      })
    }).catch(err => {
      console.error('Error deleting:', err);
      toast.error(err.message || err);
      onClose(false);
    })
  };
  const close = () => {
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-button" onClick={close}>&times;</span>
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete {product.name}?</p>
        <div className="delete-content">
          <button onClick={handleDelete} className="confirm-button">Confirm</button>
          <button onClick={close} className="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;