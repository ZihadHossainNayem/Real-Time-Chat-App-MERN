import axios from "axios";
import { createContext, useEffect } from "react";
import { useState } from "react";

export const UserContext = createContext({});

export const UserContextProvider = ({ children }) => {
  const [uname, setUname] = useState(null);
  const [id, setId] = useState(null);

  useEffect(() => {
    axios.get("/profile").then((response) => {
      setId(response.data.userId);
      setUname(response.data.username);
    });
  }, []);
  return (
    <UserContext.Provider value={{ uname, setUname, id, setId }}>
      {children}
    </UserContext.Provider>
  );
};
