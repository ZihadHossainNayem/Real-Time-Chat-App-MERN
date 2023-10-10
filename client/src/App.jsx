import { SignUp } from "./components/SignUp";
import axios from "axios";

function App() {
  axios.defaults.baseURL = "http://localhost:5559";
  axios.defaults.withCredentials = true;
  return <SignUp />;
}

export default App;
