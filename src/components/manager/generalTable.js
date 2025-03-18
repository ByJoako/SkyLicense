import React, { useState, useMemo, useEffect } from "react";

const GeneralTable = () => {
  const token = localStorage.getItem('token');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ user: "", action: "" });
  const [registros, setRegistros] = useState([]);
  const itemsPerPage = 8;

  // Obtener tipos de acciones únicos
  const actionTypes = useMemo(() => {
    return ["", ...new Set(registros.map(entry => entry.action))];
  }, [registros]);

  // Filtrar datos basados en el input del usuario
  const filtered = useMemo(() => {
    return registros.filter(registro =>
      registro.user.username.includes(filters.user.toLowerCase()) &&
      (filters.action === "" || registro.action === filters.action)
    );
  }, [registros, filters]);

  // Asegurar que la paginación no esté en una página inválida al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
    getLogger();
  }, []);

  async function getLogger() {
    try {
        const response = await fetch('/api/logger', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error en la petición");
        }
        const logger = await response.json();
        setRegistros(logger);
    } catch (err) {
      console.error(`Error al realizar la accion:`, err);
    }
  }
  // Calcular total de páginas correctamente
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  // Obtener los elementos a mostrar en la página actual
  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  return (
    <section className="section">
      <div className="section-head">
        
      <h2>General Log</h2>

      {/* Filtros */}
      <div className="filters">
        <input
          type="text"
          placeholder="Filter by user..."
          value={filters.user}
          onChange={(e) => setFilters({ ...filters, user: e.target.value })}
        />
        <select
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
        >
          {actionTypes.map((action, i) => (
            <option key={i} value={action}>
              {action || "All Actions"}
            </option>
          ))}
        </select>
      </div>
      </div>

      {/* Tabla */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="avatar-column">Avatar</th>
              <th>Name</th>
              <th>Action</th>
              <th>Details</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEntries.length > 0 ? (
              paginatedEntries.map((entry, i) => (
                <tr key={`${entry.name}-${entry.date}-${entry.action}-${i}`}>
                  <td className="avatar-cell">
                    <img src={`https://cdn.discordapp.com/avatars/${entry.user.id}/${entry.user.avatar}.png`} className="avatar" alt="User Avatar" />
                  </td>
                  <td>{entry.user.username}</td>
                  <td>{entry.action}</td>
                  <td>{entry.details}</td>
                  <td>{new Date(entry.timestamp).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">No records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>{currentPage} of {totalPages}</span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage >= totalPages}
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default GeneralTable;