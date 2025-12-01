import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import "leaflet/dist/leaflet.css";
import "./styles/tailwind.css";
import { AuthProvider } from "./context/AuthContext";
import MapaState from "./context/Mapa/MapaState";
import PagosState from "./context/Pagos/PagosState";
import UsuariosState from "./context/Usuarios/UsuariosState";
import QRState from "./context/QR/QRState";
import InvitadosState from "./context/Invitados/InvitadosState";
import AlertasState from "./context/Alertas/AlertasState";
import PersonalState from "./context/Personal/PersonalState";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <UsuariosState>
        <QRState>
          <InvitadosState>
            <AlertasState>
              <PersonalState>
        <PagosState>
          <MapaState>
            <RouterProvider router={router} />
          </MapaState>
        </PagosState>
        </PersonalState>
        </AlertasState>
        </InvitadosState>
        </QRState>
      </UsuariosState>
    </AuthProvider>
  </React.StrictMode>
);
