import { createTheme, alpha } from "@mui/material/styles";
import type { TypographyOptions } from "@mui/material/styles/createTypography";
import backgroundStars from "./img/backgroundStars.webp";

const fontFamily = "Prompt";

const fontDefinition = [
  {
    fontFamily,
    fontStyle: "normal",
    fontWeight: 500,
    fontDisplay: "swap",
    src: `url(${import.meta.env.BASE_URL}prompt-v10-latin-medium.woff2) format("woff2")`,
  },
];

const typography: TypographyOptions = {
  fontFamily: `${fontFamily}, sans-serif`,
  h1: {
    fontSize: "1.0625rem",
    "@media (min-width: 600px)": {
      fontSize: "1.25rem",
    },
  },
  button: {
    textTransform: "none",
  },
  overline: {
    textTransform: "none",
  },
  fontWeightLight: 500,
  fontWeightRegular: 500,
  fontWeightMedium: 500,
  fontWeightBold: 500,
};

export default createTheme({
  palette: {
    mode: "dark",
    divider: "#ffffff3b",
    text: {
      primary: "#fff",
    },
    primary: {
      main: "#7fb8ff",
    },
    secondary: {
      main: "#6aa5c8",
    },
    background: {
      paper: "#1e2835",
      default: "#090c12",
    },
  },
  typography,
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: `linear-gradient(to bottom, #233246 0%, #233246 100%)`,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "@font-face": fontDefinition,
        body: {
          minHeight: "100vh",
          backgroundImage: `
            radial-gradient(
              circle at 50% 50%,
              ${alpha("#081221", 0)} 0%,
              ${alpha("#081221", 0)} 60%,
              ${alpha("#081221", 0.2)} 80%,
              ${alpha("#081221", 0.6)} 100%
            ),
            linear-gradient(
              to right,
              ${alpha("#1a2b3d", 0.3)} 0%,
              ${alpha("#1a2b3d", 0)} 20%,
              ${alpha("#1a2b3d", 0)} 80%,
              ${alpha("#1a2b3d", 0.3)} 100%
              ),
            url(${backgroundStars}),
            linear-gradient(
              to top,
              #05070f 0%,
              #0b1422 40%,
              #132439 80%,
              #1c2b3e 100%
            )`,
          backgroundAttachment: "fixed",
        },
        "::selection": {
          backgroundColor: "#7fb8ff",
          color: "#132439",
        },
      },
    },
  },
});
