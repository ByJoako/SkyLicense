import React, { useEffect, useState } from "react";
import CreateProductModal from "../components/products/createProducts";
import EditProductModal from "../components/products/editProducts";
import DeleteProductModal from "../components/products/deleteProducts";
import { ToastContainer, toast } from 'react-toastify';
import "./Products.css";

const ProductAdmin = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/admin/products',{
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      if (!res.ok) {
        throw new Error('Failed fetch products');
      }
      res.json().then(data => setProducts(data));
    }).catch(err => {
      console.error('Error:', err);
      toast.error('Error fetch product');
    })
  })
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setIsEditOpen(true);
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  return (
    <div className="products-container">
      <h1>Manage Products</h1>
      <button onClick={() => setIsCreateOpen(true)}>Create Product</button>
      <ToastContainer />
      <div className="products-list">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="product-item">
              <img
                src="https://via.placeholder.com/250" // Product image placeholder
                alt={`${product.name} thumbnail`}
                className="product-thumbnail"
              />
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <button onClick={() => openEditModal(product)}>Edit</button>
            <button onClick={() => openDeleteModal(product)}>Delete</button>

            </div>
          ))
        ) : (
          <p>No products available.</p>
        )}
      </div>
          {isCreateOpen && <CreateProductModal onClose={(x) =>  {
            if (x) {
              setProducts([...products, x])
            }
            setIsCreateOpen(false)
            }
          } />}
      {isEditOpen && <EditProductModal product={selectedProduct} onClose={(x) => {
        products = products.map((p) => (p.name === selectedProduct.name? x : p))
        setIsEditOpen(false)
        }
      } />}
      {isDeleteOpen && <DeleteProductModal product={selectedProduct} onClose={(res) => {
   
        if (res) {
        setProducts(products.filter((p) => p.name !== selectedProduct.name));
      }
      setIsDeleteOpen(false)
      }
      } />}
    </div>



  );
};

export default ProductAdmin;