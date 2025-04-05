import React, { useEffect, useState, useMemo } from "react";

const KeyTable = () => {
  const token = localStorage.getItem('token');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState("");
  const [licenseRequests, setLicenseRequests] = useState([]);
  const itemsPerPage = 8;

  async function getRequest() {
    try {
      const response = await fetch('/api/request', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        
        setLicenseRequests(data);
      } else {
        throw new Error(data.message || "Error en la petición");
      }
    } catch (err) {
      console.error(`Error al realizar la accion:`, err);
    }
  }
  
  useEffect(() => {
    setCurrentPage(1);
    getRequest();
  }, []);
  
  const filtered = useMemo(() => {
    return licenseRequests.filter(request =>
      request.license_key.includes(filters.toLowerCase())
    );
  }, [licenseRequests, filters]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginatedKeys = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  return (
    <section className="section">
      <div className="section-head">
        
      <h2>License Requests</h2>
      <div className="filters">
        <input
          type="text"
          placeholder="Search license..."
          value={filters}
          onChange={(e) => setFilters(e.target.value)}
        />
      </div>
      </div>
      <div className="table-container">
        
      <table className="table">
        <thead>
          <tr>
            <th>Key</th>
            <th>IP</th>
            <th>HWID</th>
            <th>Status</th>
            <th>Code</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {paginatedKeys.length > 0 ? (
            paginatedKeys.map((request) => (
              <tr key={request.license_key}>
                <td>{request.license_key}</td>
                <td>{request.ip}</td>
                <td>{request.hwid}</td>
                <td>{request.status}</td>
                <td>{request.code}</td>
                <td>{new Date(request.timestamp).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-results">No records found</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      <div className="pagination">
        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          Previous
        </button>
        <span>{currentPage} of {totalPages || 1}</span>
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

export default KeyTable;