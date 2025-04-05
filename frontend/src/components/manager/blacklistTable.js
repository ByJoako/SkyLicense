import React, { useState, useMemo, useEffect, useCallback } from "react";

// Función para realizar peticiones a la API
async function handlerAction(action, method, token, body = null) {
  try {
    const response = await fetch(`/api/blacklist/${action}`, {
      method,
      headers: {
        "Content-Type": "application/json", // Agregado para cuando envíes JSON
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error en la petición");
    }
    return await response.json();
  } catch (error) {
    console.error(`Error al realizar la acción ${action}:`, error);
    throw error;
  }
}

const Blacklist = () => {
  const token = localStorage.getItem('token');
  const itemsPerPage = 8;
  const [blacklist, setBlacklist] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [newEntry, setNewEntry] = useState("");
  const [filter, setFilter] = useState("");

  // Obtiene la blacklist del backend al montar el componente
  useEffect(() => {
    setCurrentPage(1);
    const fetchBlacklist = async () => {
      try {
        const data = await handlerAction("list", "GET", token);
        setBlacklist(data);
      } catch (err) {
        console.error(err.message);
      }         
    };
    
    fetchBlacklist();
  }, [token]);

  // Filtrar la blacklist según el input de búsqueda
  const filteredBlacklist = useMemo(() => {
    return blacklist.filter((item) =>
      item.value.includes(filter.toLowerCase())
    );
  }, [blacklist, filter]);

  // Resetear la paginación cada vez que cambia el filtro

  // Calcular el total de páginas
  const totalPages = Math.max(1, Math.ceil(filteredBlacklist.length / itemsPerPage));

  // Obtener los elementos correspondientes a la página actual
  const paginatedBlacklist = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBlacklist.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBlacklist, currentPage, itemsPerPage]);

  // Agregar entrada a la blacklist
  const handleAddEntry = useCallback(async () => {
    const trimmedEntry = newEntry.trim();
    if (!trimmedEntry) return;

    if (blacklist.some((item) => item.value === trimmedEntry)) {
  //
      return;
    }

    // Creamos el nuevo item (podrías ajustar el type según lo que necesites)
    const newItem = { id: Date.now(), value: trimmedEntry, type: "None", request: 0};

    try {
      // Realiza la petición para agregar la entrada al backend
      const res = await handlerAction("add", "POST", token, newItem);
      newItem.country = res.data.country;
      // Actualiza la lista localmente
      setBlacklist((prev) => [...prev, newItem]);
      setNewEntry(""); // Limpiar el input
    } catch (error) {
      // El error se maneja dentro de handlerAction
    }
  }, [newEntry, blacklist, token]);

  // Manejar la tecla Enter en el input
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEntry();
    }
  };

  // Eliminar entrada de la blacklist
  const handleRemoveEntry = useCallback(
    async (id) => {
      try {
        // Realiza la petición para eliminar la entrada en el backend
        await handlerAction("remove", "POST", token, { id });
        // Actualiza la lista localmente
        setBlacklist((prev) => prev.filter((item) => item._id !== id));
      } catch (error) {
        // El error se maneja dentro de handlerAction
      }
    },
    [token]
  );

  return (
    <section className="section">
      <div className="section-head">
        <h2>Blacklist Management</h2>
        <div className="filters">
          <input
            type="text"
            placeholder="Search IP or HWID..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter IP or HWID..."
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            onKeyDown={handleKeyDown}
          />
         
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Value</th>
              <th>Type</th>
              <th>Country</th>
              <th>Request</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBlacklist.length > 0 ? (
              paginatedBlacklist.map((item) => (
                <tr key={item._id}>
                  <td>{item.value}</td>
                  <td>{item.type}</td>
                  <td>{item.country}</td>
                  <td>{item.request}</td>
                  <td>
                    <button onClick={() => handleRemoveEntry(item._id)} className="button-remove">
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span>
          {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage >= totalPages}
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default Blacklist;