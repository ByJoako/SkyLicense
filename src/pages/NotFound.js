import React from 'react';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>404</h1>
      <p>La página que buscas no existe.</p>
      <a href="/" style={{ textDecoration: 'none', color: 'blue' }}>Regresar al inicio</a>
    </div>
  );
};

export default NotFound;