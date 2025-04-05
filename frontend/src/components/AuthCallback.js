import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { useAuthContext } from './Auth';

const AuthCallback = () => {
  const { login } = useAuthContext();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');

    if (token) {
      login(token);
    } else {
      console.error('No se recibió ningún token');
    }

    setIsProcessing(false);
  }, [login]);

  return isProcessing ? <p>Processing authentication...</p> : <Navigate to="/" />;
};

export default AuthCallback;