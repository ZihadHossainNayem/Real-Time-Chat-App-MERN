import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "../context/UserContext";

export const SignUpAndLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrSignUp, setIsLoginOrSignUp] = useState("signup");

  const { setUname, setId } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLoginOrSignUp === "signup" ? "signup" : "login";
    const { data } = await axios.post(url, { username, password });
    setUname(username);
    setId(data.id);
  };

  return (
    <div className="h-screen flex justify-center items-center bg-purple-50 ">
      <div>
        <div className="pb-12">
          <h1 className="text-purple-700 font-bold text-center text-5xl">
            QuickChat
          </h1>
        </div>
        <form
          className="w-72 flex flex-col mx-auto gap-4"
          onSubmit={handleSubmit}
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
            {isLoginOrSignUp === "signup" ? "Sign Up" : "Login"}
          </button>
          <div>
            <div className="text-center mt-2">
              {isLoginOrSignUp === "signup" && (
                <div>
                  Already have an account?
                  <button
                    className="font-bold text-purple-500 pl-2"
                    onClick={() => setIsLoginOrSignUp("login")}
                  >
                    {" "}
                    Login!
                  </button>
                </div>
              )}
              {isLoginOrSignUp === "login" && (
                <div>
                  Dont have an account?
                  <button
                    className="font-bold text-purple-500 pl-2"
                    onClick={() => setIsLoginOrSignUp("signup")}
                  >
                    {" "}
                    SignUp!
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
