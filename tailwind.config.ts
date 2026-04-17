import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Modern Restaurant Palette
        pos: {
          // Deep dark mode colors for low-light environments
          dark: '#121212',
          darker: '#0A0A0A',
          card: '#1E1E1E',

          // Emerald green accents for validation and primary actions
          emerald: {
            DEFAULT: '#10B981',
            hover: '#059669',
            light: '#D1FAE5',
            dark: '#047857'
          },

          // Status colors
          success: '#10B981', // Emerald
          warning: '#F59E0B', // Amber
          danger: '#EF4444',  // Red
          info: '#3B82F6',    // Blue

          // Text colors
          text: {
            primary: '#F3F4F6', // gray-100
            secondary: '#9CA3AF', // gray-400
            muted: '#6B7280', // gray-500
          }
        }
      },
      spacing: {
        // Generous spacing for touch interfaces
        'touch-sm': '2rem',    // 32px
        'touch': '3rem',       // 48px
        'touch-lg': '4rem',    // 64px
        'touch-xl': '5rem',    // 80px
      },
      minHeight: {
        'touch': '3rem', // Minimum height for touch targets (48px)
      },
      minWidth: {
        'touch': '3rem', // Minimum width for touch targets (48px)
      },
      borderRadius: {
        'pos': '0.75rem', // 12px for modern, slightly rounded corners
      }
    },
  },
  plugins: [],
};

export default config;
