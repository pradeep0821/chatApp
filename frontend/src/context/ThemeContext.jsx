import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext();

const themes = {
  dark: {
    palette: {
      mode: 'dark',
      primary: { main: '#10b981' },
      secondary: { main: '#34d399' },
      background: { default: '#080c14', paper: '#0d111a' },
      text: { primary: '#ffffff', secondary: 'rgba(255,255,255,0.7)' }
    }
  },
  light: {
    palette: {
      mode: 'light',
      primary: { main: '#10b981' },
      background: { default: '#f8fafc', paper: '#ffffff' },
      text: { primary: '#1e293b', secondary: '#64748b' }
    }
  },
  green: {
    palette: {
      mode: 'dark',
      primary: { main: '#10b981' },
      background: { default: '#064e3b', paper: '#065f46' }
    }
  },
  lightBlue: {
    palette: {
      mode: 'dark',
      primary: { main: '#0891b2' },
      background: { default: '#0e3a62', paper: '#0c4a6e' }
    }
  },
  gray: {
    palette: {
      mode: 'dark',
      primary: { main: '#6b7280' },
      background: { default: '#1f2937', paper: '#374151' }
    }
  }
};

const getInitialTheme = () => {
  let saved = localStorage.getItem('theme') || 'dark';
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.theme) saved = user.theme;
    }
  } catch (e) {}
  
  if (!themes[saved]) saved = 'dark';
  return saved;
};

const initialState = {
  theme: getInitialTheme()
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    default:
      return state;
  }
};

export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const handleStorageChange = () => {
      let saved = localStorage.getItem('theme');
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.theme) saved = user.theme;
        }
      } catch (e) {}

      if (saved && themes[saved]) {
        dispatch({ type: 'SET_THEME', payload: saved });
      }
    };

    handleStorageChange();
    window.addEventListener('user-login', handleStorageChange);
    return () => window.removeEventListener('user-login', handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', state.theme);
    document.body.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  const muiTheme = createTheme(themes[state.theme]);

  return (
    <ThemeContext.Provider value={{ theme: state.theme, setTheme: (t) => dispatch({ type: 'SET_THEME', payload: t }) }}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeContext must be used within ThemeProvider');
  return context;
};
