import React, { useEffect, useState } from "react";
import axios from "axios";

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/users")
      .then(res => {
        setUsers(res.data);
      })
      .catch(err => {
        console.error("Error fetching users:", err);
      });
  }, []);

  return (
    <div>
      <h2>Users from Backend</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name} ({user.email})</li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
