import { BrowserRouter as Router } from 'react-router-dom';
import { createTheme } from '@mui/material/styles';
import './App.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import PageRouter from './PageRouter';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <PageRouter />
      </Router>
    </ThemeProvider>
  );
}
