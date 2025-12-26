import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import App from "./app";
import { AuthProvider } from "./features/auth/AuthProvider";

const theme = extendTheme({
  fonts: {
    heading: "'Plus Jakarta Sans', system-ui, sans-serif",
    body: "'Plus Jakarta Sans', system-ui, sans-serif"
  },
  styles: {
    global: {
      body: {
        color: "#2d2a26"
      }
    }
  },
  components: {
    Heading: {
      baseStyle: {
        fontWeight: 600,
        letterSpacing: "-0.01em"
      }
    },
    Button: {
      baseStyle: {
        borderRadius: "12px",
        fontWeight: 500,
        fontSize: "14px",
        lineHeight: "20px",
        minH: "40px",
        px: "20px",
        py: "10px"
      },
      variants: {
        gradient: {
          color: "white",
          bgGradient: "linear(135deg, #ef6939, #f6a823)",
          boxShadow: "0px 8px 30px -8px rgba(31, 36, 46, 0.12)",
          _hover: {
            filter: "brightness(1.05)"
          },
          _active: {
            filter: "brightness(0.98)"
          }
        }
      }
    },
    Tag: {
      baseStyle: {
        borderRadius: "full"
      }
    }
  },
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
