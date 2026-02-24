import { createTheme, ThemeOptions } from '@mui/material/styles';

/**
 * Material Design 3 (MD3) 主题配置
 * 参考: https://m3.material.io/styles
 *
 * 颜色系统基于 Tonal Palette，色调值 0-100
 * Typography 使用 MD3 Type Scale: Display/Headline/Title/Body/Label
 */

// MD3 色调值系统
const tones = {
  0: '#000000',
  10: '#1D1B20',
  20: '#322F35',
  30: '#49454F',
  40: '#605D66',
  50: '#79747E',
  60: '#938F99',
  70: '#AEA9B4',
  80: '#CAC4D0',
  87: '#DDD9E1',
  90: '#E6E0E9',
  92: '#ECE6F0',
  94: '#F3EFF5',
  95: '#F5F2F7',
  96: '#F7F2FA',
  98: '#FEF7FF',
  100: '#FFFFFF',
};

// MD3 Primary 蓝色系调色板 (Google Blue inspired)
const primaryPalette = {
  main: '#1A73E8',       // Tone 40 equivalent
  light: '#4285F4',      // Tone 50
  dark: '#0B57D0',       // Tone 30
  contrastText: '#FFFFFF',
  container: '#D3E3FD',  // Primary Container
  onContainer: '#041E49', // On Primary Container
};

// MD3 Secondary 中性灰调色板
const secondaryPalette = {
  main: '#5F6368',
  light: '#80868B',
  dark: '#3C4043',
  contrastText: '#FFFFFF',
  container: '#E8EAED',
  onContainer: '#1F1F1F',
};

// MD3 Surface 颜色系统
const surfacePalette = {
  // 基础表面色
  surface: '#FEF7FF',              // Tone 98 - 主背景
  onSurface: '#1D1B20',            // Tone 10 - 主文字
  onSurfaceVariant: '#49454F',     // Tone 30 - 次要文字

  // 表面变体
  surfaceDim: '#DED8E1',           // Tone 87 - 暗表面
  surfaceBright: '#FEF7FF',        // Tone 98 - 亮表面

  // 容器层次 (从小到大)
  surfaceContainerLowest: '#FFFFFF', // Tone 100
  surfaceContainerLow: '#F7F2FA',    // Tone 96
  surfaceContainer: '#F3EFF5',       // Tone 94 - 标准容器
  surfaceContainerHigh: '#ECE6F0',   // Tone 92
  surfaceContainerHighest: '#E6E0E9', // Tone 90

  // 轮廓
  outline: '#79747E',              // Tone 50
  outlineVariant: '#CAC4D0',       // Tone 80
};

const md3LightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: primaryPalette,
    secondary: secondaryPalette,
    error: {
      main: '#B3261E',
      light: '#F9DEDC',
      dark: '#8C1D18',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#1E8E3E',
      light: '#CEEAD6',
      dark: '#137333',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F9AB00',
      light: '#FEF7E0',
      dark: '#B06000',
      contrastText: '#3E2723',
    },
    background: {
      default: surfacePalette.surface,
      paper: surfacePalette.surfaceContainerLowest,
    },
    text: {
      primary: surfacePalette.onSurface,
      secondary: surfacePalette.onSurfaceVariant,
      disabled: tones[60],
    },
    divider: surfacePalette.outlineVariant,
    action: {
      active: surfacePalette.onSurfaceVariant,
      hover: 'rgba(26, 115, 232, 0.08)',
      selected: 'rgba(26, 115, 232, 0.12)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
  },
  typography: {
    // MD3 使用 Roboto 字体族
    fontFamily: '"Roboto", "Noto Sans SC", system-ui, sans-serif',

    // === MD3 Display Scale ===
    h1: {
      fontSize: 57,
      fontWeight: 400,
      lineHeight: 1.12,
      letterSpacing: '-0.25px',
    }, // Display Large

    h2: {
      fontSize: 45,
      fontWeight: 400,
      lineHeight: 1.16,
      letterSpacing: 0,
    }, // Display Medium

    h3: {
      fontSize: 36,
      fontWeight: 400,
      lineHeight: 1.22,
      letterSpacing: 0,
    }, // Display Small

    // === MD3 Headline Scale ===
    h4: {
      fontSize: 32,
      fontWeight: 400,
      lineHeight: 1.25,
      letterSpacing: 0,
    }, // Headline Large

    h5: {
      fontSize: 28,
      fontWeight: 400,
      lineHeight: 1.29,
      letterSpacing: 0,
    }, // Headline Medium

    h6: {
      fontSize: 24,
      fontWeight: 400,
      lineHeight: 1.33,
      letterSpacing: 0,
    }, // Headline Small

    // === MD3 Title Scale ===
    subtitle1: {
      fontSize: 22,
      fontWeight: 400,
      lineHeight: 1.27,
      letterSpacing: 0,
    }, // Title Large

    subtitle2: {
      fontSize: 16,
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.15px',
    }, // Title Medium

    // === MD3 Body Scale ===
    body1: {
      fontSize: 16,
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.5px',
    }, // Body Large

    body2: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.43,
      letterSpacing: '0.25px',
    }, // Body Medium

    // === MD3 Label Scale ===
    button: {
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 1.43,
      letterSpacing: '0.1px',
      textTransform: 'none',
    }, // Label Large

    caption: {
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.33,
      letterSpacing: '0.5px',
    }, // Label Medium

    overline: {
      fontSize: 11,
      fontWeight: 500,
      lineHeight: 1.45,
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
    }, // Label Small
  },
  shape: {
    // MD3 圆角系统
    borderRadius: 16,
  },
  shadows: [
    // MD3 使用 Tone-based elevation 而非阴影
    // 这里保留最小阴影用于特殊情况
    'none',
    '0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)',
    '0 1px 2px rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15)',
    '0 4px 4px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)',
    '0 6px 6px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)',
    '0 8px 8px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)',
    ...Array(19).fill('none'),
  ] as unknown as ThemeOptions['shadows'],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          scrollBehavior: 'smooth',
        },
        body: {
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
          textRendering: 'optimizeLegibility',
        },
        // 主题预览全局兜底：统一布局宽度类与中间字号类
        '.card-width-2col': {
          width: 'calc((100% - var(--container-gap, 24px)) / 2 - 1px)',
        },
        '.card-width-3col': {
          width: 'calc((100% - var(--container-gap, 24px) * 2) / 3 - 1px)',
        },
        '.card-width-4col': {
          width: 'calc((100% - var(--container-gap, 24px) * 3) / 4 - 1px)',
        },
        '.text-5-5xl': {
          fontSize: '3.375rem',
          lineHeight: 1.1,
        },
        '.text-4-5xl': {
          fontSize: '2.625rem',
          lineHeight: 1.2,
        },
        '.text-3-5xl': {
          fontSize: '2.0625rem',
          lineHeight: 1.3,
        },
        '.text-2-5xl': {
          fontSize: '1.8125rem',
          lineHeight: 1.4,
        },
        // MD3 Focus Ring 样式
        ':focus-visible': {
          outline: `2px solid ${primaryPalette.main}`,
          outlineOffset: '2px',
        },
      },
    },
    // === MD3 Button 组件 ===
    MuiButton: {
      styleOverrides: {
        root: {
          // MD3 Filled Button
          borderRadius: 20,
          padding: '10px 24px',
          minHeight: 40,
          fontWeight: 500,
          fontSize: 14,
          letterSpacing: '0.1px',
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'background-color 0.2s, transform 0.1s',
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        contained: {
          backgroundColor: primaryPalette.main,
          '&:hover': {
            backgroundColor: primaryPalette.dark,
            boxShadow: 'none',
          },
          '&:active': {
            backgroundColor: '#0842A0',
          },
        },
        containedPrimary: {
          backgroundColor: primaryPalette.main,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: primaryPalette.dark,
          },
        },
        outlined: {
          // MD3 Outlined Button
          borderRadius: 20,
          borderWidth: 1,
          borderColor: surfacePalette.outline,
          color: primaryPalette.main,
          '&:hover': {
            borderWidth: 1,
            borderColor: surfacePalette.outline,
            backgroundColor: 'rgba(26, 115, 232, 0.08)',
          },
        },
        text: {
          // MD3 Text Button
          borderRadius: 20,
          padding: '10px 12px',
          color: primaryPalette.main,
          '&:hover': {
            backgroundColor: 'rgba(26, 115, 232, 0.08)',
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    // === MD3 FAB 组件 ===
    MuiFab: {
      styleOverrides: {
        root: {
          // MD3 FAB (Low emphasis)
          borderRadius: 16,
          boxShadow: 'none',
          textTransform: 'none',
        },
        primary: {
          backgroundColor: surfacePalette.surfaceContainerHigh,
          color: primaryPalette.main,
          '&:hover': {
            backgroundColor: surfacePalette.surfaceContainerHighest,
            boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    // === MD3 TextField 组件 ===
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            // MD3 Filled TextField 样式
            borderRadius: 4,
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            backgroundColor: surfacePalette.surfaceContainerHighest,
            transition: 'background-color 0.2s, border-bottom-color 0.2s',
            '&:hover': {
              backgroundColor: tones[87],
            },
            '&.Mui-focused': {
              backgroundColor: surfacePalette.surfaceContainerHighest,
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
            borderBottom: `1px solid ${surfacePalette.onSurfaceVariant}`,
            borderRadius: 0,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderBottom: `2px solid ${surfacePalette.onSurface}`,
          },
          '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderBottom: `2px solid ${primaryPalette.main}`,
          },
          '& .MuiInputBase-input': {
            padding: '16px',
            fontSize: 16,
            '&::placeholder': {
              color: surfacePalette.onSurfaceVariant,
              opacity: 0.6,
            },
          },
          '& .MuiInputLabel-root': {
            transform: 'translate(16px, 16px) scale(1)',
            color: surfacePalette.onSurfaceVariant,
            '&.Mui-focused': {
              color: primaryPalette.main,
            },
            '&.MuiInputLabel-shrink': {
              transform: 'translate(16px, -9px) scale(0.75)',
              color: surfacePalette.onSurfaceVariant,
            },
          },
          '& .MuiInputLabel-shrink': {
            transform: 'translate(16px, -9px) scale(0.75)',
          },
        },
      },
    },
    // === MD3 Chip 组件 ===
    MuiChip: {
      styleOverrides: {
        root: {
          // MD3 Input Chip / Filter Chip
          borderRadius: 8,
          height: 32,
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: '0.1px',
        },
        filled: {
          backgroundColor: surfacePalette.surfaceContainerHigh,
          color: surfacePalette.onSurface,
          '&:hover': {
            backgroundColor: surfacePalette.surfaceContainerHighest,
          },
        },
        outlined: {
          borderColor: surfacePalette.outline,
          color: surfacePalette.onSurface,
          '&:hover': {
            backgroundColor: surfacePalette.surfaceContainer,
            borderColor: surfacePalette.outline,
          },
        },
        clickable: {
          '&:hover': {
            backgroundColor: surfacePalette.surfaceContainerHighest,
          },
        },
        colorPrimary: {
          backgroundColor: primaryPalette.container,
          color: primaryPalette.onContainer,
          '&:hover': {
            backgroundColor: '#B8D4FC',
          },
        },
        sizeSmall: {
          height: 28,
          fontSize: 12,
          borderRadius: 8,
        },
        label: {
          padding: '0 8px',
        },
      },
    },
    // === MD3 Paper 组件 ===
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: surfacePalette.surfaceContainerLow,
        },
        elevation1: {
          // MD3 使用 Surface Container 替代阴影
          backgroundColor: surfacePalette.surfaceContainer,
          boxShadow: 'none',
        },
        elevation2: {
          backgroundColor: surfacePalette.surfaceContainerHigh,
          boxShadow: 'none',
        },
        elevation3: {
          backgroundColor: surfacePalette.surfaceContainerHighest,
          boxShadow: 'none',
        },
      },
    },
    // === MD3 ListItem 组件 ===
    MuiListItemButton: {
      styleOverrides: {
        root: {
          // MD3 List Item
          borderRadius: 28,
          margin: '2px 12px',
          padding: '12px 16px',
          minHeight: 56,
          '&.Mui-selected': {
            backgroundColor: primaryPalette.container,
            color: primaryPalette.onContainer,
            '&:hover': {
              backgroundColor: '#B8D4FC',
            },
            '& .MuiListItemIcon-root': {
              color: primaryPalette.main,
            },
          },
          '&:hover': {
            backgroundColor: surfacePalette.surfaceContainerHigh,
          },
        },
      },
    },
    // === MD3 Drawer 组件 ===
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          backgroundColor: surfacePalette.surfaceContainerLow,
        },
      },
    },
    // === MD3 Divider 组件 ===
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: surfacePalette.outlineVariant,
          margin: '8px 0',
        },
      },
    },
    // === MD3 IconButton 组件 ===
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          padding: 8,
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: surfacePalette.surfaceContainerHigh,
          },
        },
        sizeSmall: {
          padding: 4,
          borderRadius: 14,
        },
      },
    },
    // === MD3 Tooltip 组件 ===
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tones[30],
          color: '#FFFFFF',
          borderRadius: 4,
          fontSize: 12,
          padding: '8px 12px',
          fontWeight: 500,
        },
        arrow: {
          color: tones[30],
        },
      },
    },
    // === MD3 AppBar 组件 ===
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: surfacePalette.surface,
          color: surfacePalette.onSurface,
          boxShadow: 'none',
          borderBottom: `1px solid ${surfacePalette.outlineVariant}`,
        },
      },
    },
    // === MD3 Card 组件 ===
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: surfacePalette.surfaceContainerLow,
          boxShadow: 'none',
          border: `1px solid ${surfacePalette.outlineVariant}`,
        },
      },
    },
    // === MD3 Tabs 组件 ===
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: 14,
          minHeight: 48,
          '&.Mui-selected': {
            color: primaryPalette.main,
          },
        },
      },
    },
    // === MD3 Alert 组件 ===
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardSuccess: {
          backgroundColor: '#CEEAD6',
          color: '#137333',
        },
        standardError: {
          backgroundColor: '#F9DEDC',
          color: '#8C1D18',
        },
        standardWarning: {
          backgroundColor: '#FEF7E0',
          color: '#B06000',
        },
        standardInfo: {
          backgroundColor: primaryPalette.container,
          color: primaryPalette.onContainer,
        },
      },
    },
    // === MD3 CircularProgress 组件 ===
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: primaryPalette.main,
        },
      },
    },
  },
};

export const md3Theme = createTheme(md3LightThemeOptions);

// === 扩展主题类型声明 ===
declare module '@mui/material/styles' {
  interface Palette {
    surface: {
      surface: string;
      onSurface: string;
      onSurfaceVariant: string;
      surfaceDim: string;
      surfaceBright: string;
      surfaceContainerLowest: string;
      surfaceContainerLow: string;
      surfaceContainer: string;
      surfaceContainerHigh: string;
      surfaceContainerHighest: string;
      outline: string;
      outlineVariant: string;
    };
    primaryContainer: {
      main: string;
      onContainer: string;
    };
  }
  interface PaletteOptions {
    surface?: Palette['surface'];
    primaryContainer?: Palette['primaryContainer'];
  }
}

// 添加扩展颜色到主题
(md3Theme.palette as Palette).surface = surfacePalette;
(md3Theme.palette as Palette).primaryContainer = {
  main: primaryPalette.container,
  onContainer: primaryPalette.onContainer,
};

interface Palette {
  surface: typeof surfacePalette;
  primaryContainer: {
    main: string;
    onContainer: string;
  };
}

// 导出颜色常量供组件直接使用
export const md3Colors = {
  primary: primaryPalette,
  secondary: secondaryPalette,
  surface: surfacePalette,
  tones,
};

// 导出 Typography Scale 常量
export const md3TypeScale = {
  displayLarge: { fontSize: 57, fontWeight: 400, lineHeight: 1.12 },
  displayMedium: { fontSize: 45, fontWeight: 400, lineHeight: 1.16 },
  displaySmall: { fontSize: 36, fontWeight: 400, lineHeight: 1.22 },
  headlineLarge: { fontSize: 32, fontWeight: 400, lineHeight: 1.25 },
  headlineMedium: { fontSize: 28, fontWeight: 400, lineHeight: 1.29 },
  headlineSmall: { fontSize: 24, fontWeight: 400, lineHeight: 1.33 },
  titleLarge: { fontSize: 22, fontWeight: 400, lineHeight: 1.27 },
  titleMedium: { fontSize: 16, fontWeight: 500, lineHeight: 1.5 },
  titleSmall: { fontSize: 14, fontWeight: 500, lineHeight: 1.43 },
  bodyLarge: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 },
  bodyMedium: { fontSize: 14, fontWeight: 400, lineHeight: 1.43 },
  bodySmall: { fontSize: 12, fontWeight: 400, lineHeight: 1.33 },
  labelLarge: { fontSize: 14, fontWeight: 500, lineHeight: 1.43 },
  labelMedium: { fontSize: 12, fontWeight: 500, lineHeight: 1.33 },
  labelSmall: { fontSize: 11, fontWeight: 500, lineHeight: 1.45 },
};
