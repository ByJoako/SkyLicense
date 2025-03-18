import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../components/Auth';
import './Products.css'; // Import CSS
import './productsAdmin.css'; // Import CSS

const Products = () => {
  const token = localStorage.getItem('token');
  const { user } = useAuthContext(); // Token from the auth context
  const [products, setProducts] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState({}); // Tracks selected version per product

  // Fetch products when the component mounts
  useEffect(() => {
    fetch('/api/products', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`, // Adding token in header
        },
      })
      .then((response) => setProducts(response.data))
      .catch((error) => console.error('Error fetching products:', error));
  }, [token]);

  // Change selected version per product
  const handleVersionChange = (productId, version) => {
    setSelectedVersion((prev) => ({ ...prev, [productId]: version }));
  };

  // Handle file download
  const handleDownload = async (product) => {
    const version = selectedVersion[product._id];
    if (!version) {
      alert('Please select a version to download.');
      return;
    }

    const downloadUrl = `/api/products/${product.name}/${version}/download`;

    const response = await fetch(downloadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${product.name}-${version}`); // File name
      document.body.appendChild(link);
      link.click();
    } else {
      console.error('Error', response);
      alert('An error occurred while downloading.');
    }
  };

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="products-container">
      <h1>My Products</h1>
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
              <div className="product-actions">
                <select
                  id={`version-${product._id}`}
                  onChange={(e) => handleVersionChange(product._id, e.target.value)}
                  defaultValue=""
                >
                  {product.versions.map((version, index) => (
                    <option key={index} value={version}>
                      {version}
                    </option>
                  ))}
                </select>
                <button onClick={() => handleDownload(product)}>Download</button>
              </div>
            </div>
          ))
        ) : (
          <p>No products available.</p>
        )}
      </div>
    </div>
  );
};

export default Products;