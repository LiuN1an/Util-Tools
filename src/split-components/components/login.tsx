import React, { FC } from "react";
import { LoginProps } from "../register";

export const Login: FC<LoginProps> = ({ logout }) => {
  return <div onClick={() => logout()}>login</div>;
};
