import { observer } from "mobx-react-lite";
import { componentRender } from "./core";

export const App = observer(() => {
  const Login = componentRender("login");
  return (
    <>
      <Login />
    </>
  );
});
