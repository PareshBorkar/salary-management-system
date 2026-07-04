import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1f6feb"
    },
    secondary: {
      main: "#0f766e"
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff"
    },
    text: {
      primary: "#17212f",
      secondary: "#5b677a"
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: ["Aptos", "Segoe UI", "sans-serif"].join(","),
    h1: {
      fontSize: "2rem",
      fontWeight: 700
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 700
    },
    button: {
      fontWeight: 600,
      textTransform: "none"
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none"
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    }
  }
});
