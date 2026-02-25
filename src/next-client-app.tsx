'use client';

import { useEffect } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import App from './App';
import { md3Theme } from './theme/md3-theme';
import { scheduleNonCriticalAssetsLoad } from './utils/non-critical-assets';

export default function NextClientApp() {
  useEffect(() => {
    scheduleNonCriticalAssetsLoad();
  }, []);

  return (
    <ThemeProvider theme={md3Theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}
