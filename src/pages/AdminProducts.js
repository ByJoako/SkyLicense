import React, { useState } from "react";
import CreateProductModal from "../components/products/createProducts";
import EditProductModal from "../components/products/editProducts";
import DeleteProductModal from "../components/products/deleteProducts";
import "./Products.css";

const ProductAdmin = () => {
  const [message, setMessage] = useState(null);
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Product 1",
      description: "This is a test product",
      image: "https://via.placeholder.com/50",
      versions: ["1.0", "1.1"],
      role: "Admin",
    },
    {
      id: 2,
      name: "Product 2",
      description: "This is a test product",
      image: "https://via.placeholder.com/50",
      versions: ["1.0", "1.1"],
      role: "Admin",
    },
  ]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
      {message && <div className={`floating-message ${message.type}`}>{message.text}</div>}
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
            products.push(x)
            setIsCreateOpen(false)
            }
            } />}
      {isEditOpen && <EditProductModal product={selectedProduct} onClose={() => setIsEditOpen(false)} />}
      {isDeleteOpen && <DeleteProductModal product={selectedProduct} onClose={(res) => {
      //products.remove(res.product);
      setTimeout(function() {
        if (message == res) setMessage(null);
      }, 10000);
      setMessage(res);
      setIsDeleteOpen(false)
      }
      } />}
    </div>



  );
};

export default ProductAdmin;