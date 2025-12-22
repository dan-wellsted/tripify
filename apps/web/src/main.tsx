import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import App from "./app";
import { AuthProvider } from "./features/auth/AuthProvider";

const theme = extendTheme({
  colors: {
    brand: {
      50: "#f5f9ff",
      100: "#d9e6ff",
      200: "#b3ccff",
      300: "#8cb2ff",
      400: "#6699ff",
      500: "#3f7fff",
      600: "#335fcc",
      700: "#264599",
      800: "#1a2c66",
      900: "#0d1533"
    }
  }
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
