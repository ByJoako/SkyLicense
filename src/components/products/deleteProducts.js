import React from "react";
import axios from 'axios';
import { toast } from 'toasty';

const DeleteProductModal = ({ product, onClose }) => {
  const token = localStorage.getItem("token");
  
  const handleDelete = async () => {
    fetch('/api/admin/products/delete', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      data: { productId: product._id },
    }).then(res => {
      if (!res.ok) {
        throw new Error('Failed to delete product');
      }
      toast.success('Product deleted successfully');
      onClose(true);
    }).catch(err => {
      console.error('Error deleting:', err);
      toast.error('Error deleting product');
      onClose(false);
    })
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