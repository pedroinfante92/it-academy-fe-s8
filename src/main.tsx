import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { router } from "./router";
import { RouterProvider } from "react-router-dom";

import "leaflet/dist/leaflet.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
