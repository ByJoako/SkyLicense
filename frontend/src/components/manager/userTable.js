import React, { useState, useCallback, useMemo, useEffect } from "react";

const UserTable = () => {
  const token = localStorage.getItem('token');
  const itemsPerPage = 8;
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userFilters, setUserFilters] = useState("");
  const [users, setUsers] = useState([]);

async function updateBan(userId) {
    try {
      const response = await fetch(`/api/users/${userId}/ban`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      if (response.ok) {
        
      } else {
        throw new Error(data.message || "Error en la petición");
      }
    } catch (err) {
      console.error(`Error al realizar la accion:`, err);
    }
  }
async function updateRole(userId, newRole) {
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newRole })
      });
      
      const data = await response.json();
      if (response.ok) {
        
      } else {
        throw new Error(data.message || "Error en la petición");
      }
    } catch (err) {
      console.error(`Error al realizar la accion:`, err);
    }
  }
async function getUsers() {
    try {
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        throw new Error(data.message || "Error en la petición");
      }
    } catch (err) {
      console.error(`Error al realizar la accion:`, err);
    }
  }
  
  useEffect(() => {
    setUserCurrentPage(1);
    getUsers();
  }, []);
  // Cambiar rol de usuario
  const handleRoleChange = useCallback(async (userId, newRole) => {
    await updateRole(userId, newRole);
    setUsers(prevUsers =>
      prevUsers.map(user => (user.id == userId ? { ...user, role: newRole } : user))
    );
  }, []);

  // Banear o desbanear usuario
  const toggleBanUser = useCallback((userId) => {
    updateBan(userId);
    setUsers(prevUsers =>
      prevUsers.map(user => (user._id == userId ? { ...user, isBanned: !user.isBanned } : user))
    );
  }, []);

  // Filtrar usuarios basados en el input
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.username.includes(userFilters.toLowerCase())
    );
  }, [users, userFilters]);

  // Resetear paginación si cambian los filtros
  useEffect(() => {
    setUserCurrentPage(1);
  }, [userFilters]);

  // Calcular total de páginas correctamente
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

  // Obtener los usuarios de la página actual
  const paginatedUsers = useMemo(() => {
    const startIndex = (userCurrentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, userCurrentPage]);

  return (
    <section className="section">
      <div className="section-head">
        
      <h2>User Management</h2>

      {/* Filtro de búsqueda */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search user..."
          value={userFilters}
          onChange={(e) => setUserFilters(e.target.value)}
        />
      </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="avatar-column">Avatar</th>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user, i) => (
                <tr key={`${user.id}-${i}`}>
                  <td className="avatar-cell">
                    <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} className="avatar" alt="User Avatar" />
                  </td>
                  <td>{user.username}</td>
<td>
  <select 
    value={user.role} 
    onChange={(e) => handleRoleChange(user._id, e.target.value)} 
    disabled={user.role == "Owner"}
  >
    <option value="User">User</option>
    <option value="Admin">Admin</option>
    <option value="Owner">Owner</option>
  </select>
</td>
                  <td>{user.isBanned ? "Banned" : "Active"}</td>
                  <td>
                    <button 
                      onClick={() => toggleBanUser(user._id)} 
                      className={user.isBanned ? "button-unban" : "button-ban"}
                    >
                      {user.isBanned ? "Unban" : "Ban"}
                    </button>
                  </td>
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
          onClick={() => setUserCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={userCurrentPage === 1}
        >
          Previous
        </button>
        <span>{userCurrentPage} of {totalPages}</span>
        <button 
          onClick={() => setUserCurrentPage(prev => Math.min(prev + 1, totalPages))} 
          disabled={userCurrentPage >= totalPages}
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default UserTable;