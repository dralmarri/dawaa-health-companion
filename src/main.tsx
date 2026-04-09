import { createRoot } from "react-dom/client";
import ErrorBoundary from "./components/ErrorBoundary";
import App from "./App.tsx";
import "./index.css";
import { initStore } from "@/lib/store";

const render = () => {
  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
};

const timeout = new Promise<void>((resolve) => setTimeout(resolve, 3000));

Promise.race([initStore(), timeout]).then(render).catch(render);
