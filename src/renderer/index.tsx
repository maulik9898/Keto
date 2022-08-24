import { ThemeProvider } from '@emotion/react';
import { CssBaseline, Paper } from '@mui/material';
import { createRoot } from 'react-dom/client';
import App from './App';
import { brandingDarkTheme, brandingLightTheme } from './theme/theme';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <ThemeProvider theme={brandingDarkTheme}>
    <CssBaseline />
    <Paper elevation={0} className="min-h-full min-w-full flex rounded-none">
      <App />
    </Paper>
  </ThemeProvider>
);
