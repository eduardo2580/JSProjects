import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './i18n'; // Importa a configuração do i18next para internacionalização

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

/**
 * The root React DOM container for rendering the application.
 * Created by calling ReactDOM.createRoot with the DOM element having the id 'root'.
 * @type {ReactDOM.Root}
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normaliza o CSS e fornece base para o Material UI */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

