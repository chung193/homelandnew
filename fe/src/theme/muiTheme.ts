import { createTheme } from '@mui/material/styles';
import { viVN as viVNCore, enUS as enUSCore } from '@mui/material/locale';
import { viVN as viVNPickers, enUS as enUSPickers } from '@mui/x-date-pickers/locales';
import { viVN as viVNGrid, enUS as enUSGrid } from '@mui/x-data-grid/locales';
import { colors, type PaletteMode } from '@mui/material';

const base = {
    typography: {
        fontFamily: [
            'Poppins',
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
        ].join(','),

        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 700,
    },

    components: {
        MuiCssBaseline: {
            styleOverrides: {
                'html, body, #root': {
                    minHeight: '100%',
                },
                body: {
                    fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                },
                strong: {
                    fontWeight: 700,
                },
                b: {
                    fontWeight: 700,
                },
                span: {
                    fontSize: '0.9rem',
                },
                small: {
                    color: '#bdc3c7',
                    fontSize: '0.7rem',
                }
            },
        },

        MuiLink: {
            styleOverrides: {
                root: {
                    textDecoration: 'none',
                    fontWeight: 500,
                    color: colors.blueGrey[700],
                    '&:hover': {
                        color: colors.blueGrey[900],
                    },
                }
            }
        },

        MuiDataGrid: {
            styleOverrides: {
                cell: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'left',
                },
                columnHeader: {
                    justifyContent: 'left',
                },
                columnHeaderTitle: {
                    fontWeight: 600,
                    textAlign: 'center',
                },
            },
        },

        MuiListItemButton: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        color: '#e2e8f0',
                    },
                    '&.Mui-selected': {
                        color: '#cbd5e1',
                        '&:hover': {
                            color: '#cbd5e1',
                        },
                    },
                },
            },
        },

        MuiTab: {
            styleOverrides: {
                root: {
                    '&.Mui-focusVisible': {
                        outline: 'none',
                    },
                    '&:focus': {
                        outline: 'none',
                    },
                },
            },
        },

        MuiIconButton: {
            defaultProps: {
                disableRipple: true,
                disableFocusRipple: true,
            },
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                    '&:focus': {
                        outline: 'none',
                        boxShadow: 'none',
                    },
                    '&:focus-visible': {
                        outline: 'none',
                        boxShadow: 'none',
                    },
                    '&:active': {
                        boxShadow: 'none',
                    },
                },
            },
        },
    },

    palette: {
        mode: 'light',
        primary: { main: '#2c3e50', dark: '#1a252f', light: '#384e63', lighter: '#e8ecf1' },
        secondary: { main: '#8e44ad', dark: '#6c2e8c', light: '#a55fc4', lighter: '#f3ebf8' },
        error: { main: '#e74c3c', light: '#ec706b', lighter: '#fdeaea' },
        warning: { main: '#f39c12', light: '#f5b041', lighter: '#fef5e7' },
        info: { main: '#3498db', light: '#5dade2', lighter: '#ebf5fb' },
        success: { main: '#27ae60', light: '#52be80', lighter: '#eafaf1' },
        background: {
            default: '#f5f6f8',
            paper: '#fff',
            searchBox: '#e2e8f0',
        },
        text: {
            primary: '#1f2937',
            secondary: '#6b7280',
        },
        menu: {
            primary: '#e2e8f0',
            secondary: '#94a3b8',
        },
    },
};

const darkOverrides = {
    palette: {
        mode: 'dark',
        primary: { main: '#2c3e50', light: '#64748b', lighter: '#1e293b' },
        secondary: { main: '#8e44ad', light: '#a55fc4', lighter: '#2d1b4e' },
        error: { main: '#e74c3c', light: '#ec706b', lighter: '#3d2520' },
        warning: { main: '#f39c12', light: '#f5b041', lighter: '#3d3220' },
        info: { main: '#3498db', light: '#5dade2', lighter: '#1e3a5f' },
        success: { main: '#27ae60', light: '#52be80', lighter: '#1f3a2f' },
        background: {
            default: '#0f172a',
            paper: '#1e293b',
        },
        text: {
            primary: '#f1f5f9',
            secondary: '#cbd5e1',
        },
        menu: {
            primary: '#f1f5f9',
            secondary: '#cbd5e1',
        },
    },
};

export const makeMuiTheme = (
    lang: 'vi' | 'en' = 'vi',
    mode: PaletteMode = 'light'
) => {
    const locales =
        lang === 'vi'
            ? [viVNCore, viVNPickers, viVNGrid]
            : [enUSCore, enUSPickers, enUSGrid];

    const palette =
        mode === 'dark'
            ? { ...base.palette, ...darkOverrides.palette, mode: 'dark' }
            : { ...base.palette, mode: 'light' };

    return createTheme(
        { ...base, palette },
        ...locales
    );
};
