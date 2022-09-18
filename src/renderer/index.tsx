import { ThemeProvider } from '@emotion/react';
import { CssBaseline, Paper } from '@mui/material';
import { createRoot } from 'react-dom/client';
import App from './App';
import { brandingDarkTheme, brandingLightTheme } from './theme/theme';
import decode from './cantool/canDecode';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <ThemeProvider theme={brandingDarkTheme}>
    <Paper
      className="min-h-full min-w-full flex rounded-none"
      style={{ borderRadius: '0px' }}
    >
      <App />
    </Paper>
  </ThemeProvider>
);
