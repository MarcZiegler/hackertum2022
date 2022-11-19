import React, { createContext, useCallback, useContext } from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import BuildIcon from '@mui/icons-material/Build';

import FrontPage from './components/FrontPage';
import { ThemeProvider } from '@emotion/react';
import { createTheme, responsiveFontSizes, Grid, Typography } from '@mui/material';
import StockPage from './components/StockPage';
//import Particles from "react-particles";
//import { loadFull } from "tsparticles";
import type { Container, Engine } from "tsparticles-engine";
import { AuthContextProvider, useAuthContext } from './components/context/AuthContext';
import Login from './components/Login';
let theme = createTheme({
  palette: {
    primary: {
      light: '#ffffff',
      main: '#002951',
      dark: '#4052b3',
      contrastText: '#000',
    },
    secondary: {
      light: '#ffffff',
      main: '#002951',
      dark: '#4052b3',
      contrastText: '#000',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: [
      //'Anonymous Pro',
      '"Inter Tight"',
      /*
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
      */
    ].join(','),
    allVariants: {
      color: "#000"
    },
  },
});
theme = responsiveFontSizes(theme);
/**
   * Entry point and page routing
   * @returns component : {JSX.Element}
   */
const App: React.FC = () => {
  /*
  const particlesInit = useCallback(async (engine: Engine) => {
      console.log(engine);

      // you can initialize the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
      await console.log(container);
  }, []);
  */
  return <>
    <div className="App">
      <AuthContextProvider>
      <Router>
        <ThemeProvider theme={theme}>
          <Routes>
            <Route path="/" element={<FrontPage />} />
            <Route path="/stock/:id" element={<StockPage />} />
            <Route path="*" element={<Error404 />} />
          </Routes>
        </ThemeProvider>
      </Router>
      </AuthContextProvider>
    </div>
  </>
}

/**
 * Page not found component
 * @returns component : {JSX.Element}
 */
function Error404() {
  return (
    <div>
      <Grid
        container
        spacing={0}
        direction="column"
        sx={{ minHeight: '100vh', alignItems: "center", justify: "center" }}
      >
        <Grid item xs={6} md={3}>
          <Typography variant="h2" gutterBottom align="center">
            <BuildIcon style={{ fontSize: 60 }} />
          </Typography>
          <Typography variant="h2" gutterBottom align="center">
            Error404
          </Typography>
          <Typography variant="h4" gutterBottom align="center">
            Page not found
          </Typography>
        </Grid>
      </Grid>
    </div>
  )
};

export default App;
