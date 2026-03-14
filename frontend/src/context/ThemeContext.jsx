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

// ─── Key fix: read ONLY from user object, never from standalone 'theme' key ──
// The standalone 'theme' key is shared across all users on this browser,
// so User 1 selecting 'light' would pollute User 2's session.
// We ONLY trust user.theme from the currently logged-in user object.
const getThemeFromUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.theme && themes[user.theme]) return user.theme;
    }
  } catch (e) {}
  return 'dark'; // safe default — only used when no user is logged in
};

const initialState = {
  theme: getThemeFromUser()
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
    // Called on mount AND on 'user-login' event (fired from LoginPage after login).
    // Reads the CURRENT user's theme from their user object in localStorage.
    // This is keyed to the user object — not a global key — so different
    // users on the same browser always get their own theme.
    const syncThemeFromUser = () => {
      const newTheme = getThemeFromUser();
      dispatch({ type: 'SET_THEME', payload: newTheme });
    };

    syncThemeFromUser();

    // LoginPage fires this after: localStorage.setItem('user', JSON.stringify(user))
    // So by the time the handler runs, the new user's object (with their theme) is in localStorage.
    window.addEventListener('user-login', syncThemeFromUser);
    return () => window.removeEventListener('user-login', syncThemeFromUser);
  }, []);

  // When theme changes, update data-theme attribute for any CSS variable consumers.
  // Do NOT write to a standalone 'theme' key — that's what caused the cross-user bleed.
  useEffect(() => {
    document.body.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  // Called by SettingsPage after saving to DB.
  // Also updates the user object in localStorage so the theme persists on next login.
  const setTheme = (newTheme) => {
    if (!themes[newTheme]) return;
    dispatch({ type: 'SET_THEME', payload: newTheme });

    // Keep user object in localStorage in sync so next login reads correct theme.
    // This does NOT write a shared 'theme' key — only updates the user object.
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        localStorage.setItem('user', JSON.stringify({ ...user, theme: newTheme }));
      }
    } catch (e) {}
  };

  const muiTheme = createTheme(themes[state.theme]);

  return (
    <ThemeContext.Provider value={{ theme: state.theme, setTheme }}>
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