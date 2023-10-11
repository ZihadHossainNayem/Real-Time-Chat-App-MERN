import axios from "axios";
import { UserContextProvider } from "./context/UserContext";
import { Routes } from "./components/Routes";

function App() {
  axios.defaults.baseURL = "http://localhost:5559";
  axios.defaults.withCredentials = true;

  return (
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
  );
}

export default App;
