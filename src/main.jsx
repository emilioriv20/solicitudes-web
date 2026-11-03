import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { SolicitudesProvider } from "./context/SolicitudesContext";
import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <SolicitudesProvider>
            <App />
        </SolicitudesProvider>
    </React.StrictMode>
);