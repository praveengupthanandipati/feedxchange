import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./app.routes";

/** The application root: one router for the domain. The route table, layouts and per-area providers live in their own modules. */
const App = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

export default App;
