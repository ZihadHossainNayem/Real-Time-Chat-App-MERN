import { useState } from "react";
import axios from "axios";

export const SignUp = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const signUp = async (e) => {
    e.preventDefault();
    await axios.post("/signup", { username, password });
  };

  return (
    <div className="h-screen flex items-center bg-purple-50 ">
      <form
        className="w-72 flex flex-col mx-auto gap-4 mb-16"
        onSubmit={signUp}
      >
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border border-purple-200 rounded"
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-purple-200 rounded"
        />
        <button className="w-full p-2 bg-purple-500 text-white rounded">
          Sign Up
        </button>
      </form>
    </div>
  );
};
