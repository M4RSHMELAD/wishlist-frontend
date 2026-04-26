const generateColor = (color, arr) => {
  return arr.reduce((res, value) => {
    res[value] = `var(--${color}-${value})`;
    return res;
  }, {});
};
const arr_10_100 = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10];
const arr_50_950 = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const arr_0_900 = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const arr_0_900_alpha = [...arr_0_900, 'alpha'];

export const screens = {
  sm: '1px',
  md: '768px',
  lg: '1200px',
  xl: '1280px',
  '2xl': '1536px',
};

export const colors = {
  // Common
  current: 'currentColor',
  transparent: 'transparent',
  // Primary
  primary: {
    ...generateColor('primary', arr_0_900_alpha),
    DEFAULT: 'var(--primary-color)',
  },
  // Service
  danger: 'var(--red-400)',
  warning: 'var(--orange-400)',
  success: 'var(--green-400)',
  info: 'var(--blue-400)',
  help: 'var(--purple-400)',
  // Neutrals
  white: {
    ...generateColor('white', arr_10_100),
    DEFAULT: 'var(--white-100)',
  },
  black: {
    ...generateColor('black', arr_10_100),
    DEFAULT: 'var(--black-100)',
  },
  //Surface
  surface: {
    ...generateColor('surface', arr_0_900),
    ground: 'var(--surface-ground)',
    section: 'var(--surface-section)',
    card: 'var(--surface-card)',
    overlay: 'var(--surface-overlay)',
    border: 'var(--surface-border)',
    hover: 'var(--surface-hover)',
    transparent: 'transparent', // rgba(255, 255, 255, 0.0001) - в фигме нет transparent, это костыль на нее
  },
  // Text
  color: 'var(--text-color)',
  'color-secondary': 'var(--text-color-secondary)',
  'color-primary': 'var(--primary-color-text)',
}

export const themeExtend = {
  boxShadow: {
    md: '0 3px 5px #00000005,0 0 2px #0000000d,0 1px 4px #00000014',
  },
  fontFamily: {
    sans: ['var(--font-family)'],
  },
  zIndex: {
    '1000': '1000',
    '1010': '1010',
    '1100': '1100',
    '1110': '1110',
  },
};

/**
 * Для иконок, чтобы можно было использовать icon-2xl, md:icon-3xl и тд
 *
 * @param matchUtilities
 * @param theme
 */
export const iconsPluginCallback = ({ matchUtilities, theme }) => {
  const fontSize = theme('fontSize');

  matchUtilities(
    {
      icon: (value) => ({
        'svg&': {
          width: value,
          height: value,
        },
      }),
    },
    {
      values: Object.fromEntries(
        Object.entries(fontSize).map(([key, value]) => [key, value[0]])
      ),
    }
  );
}
