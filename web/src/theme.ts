import { createTheme } from "@mui/material/styles";
import "@fontsource/lato"; // Import Lato font from Google Fonts

const theme = createTheme({
  palette: {
    primary: {
      main: "#9C79A6", // Lilac color for primary elements
    },
    secondary: {
      main: "#B0B0B0", // Muted gray for secondary elements
    },
  },
  typography: {
    // @ts-ignore
    fontSize: 13,
    fontFamily: "Lato, Arial, sans-serif", // Using Lato as the default font
    button: {
      textTransform: "none", // Disable uppercase on buttons
    },
    h1: {
      fontFamily: "Patua One",
    },
    h2: {
      fontFamily: "Patua One",
    },
    h3: {
      fontFamily: "Patua One",
    },
    h4: {
      fontFamily: "Patua One",
    },
    h5: {
      fontFamily: "Patua One",
    },
    h6: {
      fontFamily: "Patua One",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "0.75rem", // Small button size
          padding: "6px 12px", // Adjust button padding
          borderRadius: "20px", // Rounded button corners
          "&:focus": {
            "--tw-ring-color": "rgba(156, 121, 166, 0.5)!important",
          },
        },
        outlined: {
          borderColor: "#9C79A6", // Primary color outline for outlined variant
          color: "#9C79A6", // Primary color text for outlined buttons
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "16px", // Rounded modals
        },
      },
    },
  },
});

export default theme;
