import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const notifySuccess = () => {
    toast.success("Operación exitosa!", {
      position: "top-right",
      autoClose: 3000, // 3 segundos
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    });
  };

  const notifyError = () => {
    toast.error("Ocurrió un error!", {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
    });
  };

  return (
    <div>
      <button onClick={notifySuccess}>Mostrar Éxito</button>
      <button onClick={notifyError}>Mostrar Error</button>

      <ToastContainer />
    </div>
  );
};

export default App;