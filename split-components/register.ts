import { Login } from "./components";
import { middleware } from "./core";

middleware.addComp({ name: "login", component: Login });

export interface LoginProps {
  logout: () => void;
}

const io = {
  name: "logout",
  pipe: async () => {
    return {
      status: true,
      data: "log out",
    };
  },
  component: "login",
};
middleware.addIO(io);
middleware.addProps(io.component, { [io.name]: io.pipe });
