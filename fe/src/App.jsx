import { CssBaseline } from '@mui/material';
import MainRoutes from './routes/MainRoutes';
import { ThemeModeProvider } from '@providers/ThemeModeProvider';
import GlobalProvider from '@providers/GlobalProvider'

export default function App() {

  return (
    <ThemeModeProvider>
      <GlobalProvider>
        <CssBaseline />
        <MainRoutes />
      </GlobalProvider>
    </ThemeModeProvider>
  );
}
