import { useContext } from "react";
import { SignUpAndLogin } from "./SignUpAndLogin";
import { UserContext } from "../context/UserContext";

export const Routes = () => {
  const { uname, id } = useContext(UserContext);

  if (uname) {
    return "logged in!" + uname;
  }
  return <SignUpAndLogin />;
};
