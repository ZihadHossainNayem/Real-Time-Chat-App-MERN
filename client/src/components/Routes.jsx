import { useContext } from "react";
import { SignUpAndLogin } from "./SignUpAndLogin";
import { UserContext } from "../context/UserContext";
import { ChatPage } from "./ChatPage";

export const Routes = () => {
  const { uname, id } = useContext(UserContext);

  if (uname) {
    return <ChatPage />;
  }
  return <SignUpAndLogin />;
};
