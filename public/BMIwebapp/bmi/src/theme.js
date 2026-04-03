import { createTheme } from '@mui/material/styles';

// Example Material You-inspired theme
// Colors can be customized further based on dynamic theming if desired,
// but for now, a static example.
/**
 * Custom Material-UI theme inspired by Material You design principles.
 *
 * @constant
 * @type {import('@mui/material/styles').Theme}
 * @property {Object} palette - Defines the color palette for the application.
 * @property {Object} palette.primary - Primary color settings.
 * @property {string} palette.primary.main - Main primary color (#6750A4).
 * @property {Object} palette.secondary - Secondary color settings.
 * @property {string} palette.secondary.main - Main secondary color (#7D5260).
 * @property {Object} palette.background - Background color settings.
 * @property {string} palette.background.default - Default background color (#FFFBFE).
 * @property {string} palette.background.paper - Paper background color (#FFFFFF).
 * @property {Object} palette.text - Text color settings.
 * @property {string} palette.text.primary - Primary text color (#1C1B1F).
 * @property {string} palette.text.secondary - Secondary text color (#49454F).
 * @property {Object} palette.error - Error color settings.
 * @property {string} palette.error.main - Main error color (#B3261E).
 *
 * @property {Object} typography - Typography settings for the theme.
 * @property {string} typography.fontFamily - Font family used throughout the app.
 * @property {Object} typography.h1 - Heading 1 style.
 * @property {Object} typography.h2 - Heading 2 style.
 * @property {Object} typography.h3 - Heading 3 style.
 * @property {Object} typography.h4 - Heading 4 style.
 * @property {Object} typography.h5 - Heading 5 style.
 * @property {Object} typography.h6 - Heading 6 style.
 * @property {Object} typography.button - Button text style.
 *
 * @property {Object} shape - Shape settings for the theme.
 * @property {number} shape.borderRadius - Default border radius for components (12).
 *
 * @property {Object} components - Component-specific overrides and default props.
 * @property {Object} components.MuiPaper - Overrides for the Paper component.
 * @property {Object} components.MuiButton - Overrides for the Button component.
 * @property {Object} components.MuiTextField - Default props for the TextField component.
 * @property {Object} components.MuiSelect - Default props for the Select component.
 */
const theme = createTheme({
  palette: {
    primary: {
      main: '#6750A4', // A Material You-style purple
    },
    secondary: {
      main: '#7D5260', // A Material You-style pink/maroon
    },
    background: {
      default: '#FFFBFE', // Light background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1B1F',
      secondary: '#49454F',
    },
    error: {
      main: '#B3261E',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 400,
    },
    h2: {
      fontWeight: 400,
    },
    h3: {
      fontWeight: 400,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none', // More modern button text
      fontWeight: 500,
    }
  },
  shape: {
    borderRadius: 12, // Softer corners, common in Material You
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: '16px', // Default padding for Paper
        },
        elevation1: {
          boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)', // More subtle shadows
        },
        elevation3: {
           boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.3), 0px 4px 8px 3px rgba(0, 0, 0, 0.15)',
        }
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Consistent button border radius
        },
      },
    },
    MuiTextField: {
        defaultProps: {
            variant: 'filled', // Filled variant is common in Material You
        }
    },
    MuiSelect: {
        defaultProps: {
            variant: 'filled',
        }
    }
  },
});

export default theme;
