import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Router from "./Router.jsx";
import { ToastProvider } from "./components/common/Toast.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <Router />
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
