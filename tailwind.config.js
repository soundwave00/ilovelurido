/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Day palette
        'l-bg': 'var(--l-bg)',
        'l-surface': 'var(--l-surface)',
        'l-surface-alt': 'var(--l-surface-alt)',
        'l-border': 'var(--l-border)',
        'l-border-strong': 'var(--l-border-strong)',
        'l-text': 'var(--l-text)',
        'l-text-muted': 'var(--l-text-muted)',
        'l-text-faint': 'var(--l-text-faint)',
        'l-chip': 'var(--l-chip)',
        'l-success': 'var(--l-success)',
        'l-danger': 'var(--l-danger)',
        // Accent (set dynamically by ThemeProvider)
        'l-accent': 'var(--l-accent)',
        'l-accent-glow': 'var(--l-accent-glow)',
        'l-accent-ink': 'var(--l-accent-ink)',
      },
      fontFamily: {
        display: ['SpaceGrotesk_600SemiBold', 'System'],
        'display-bold': ['SpaceGrotesk_700Bold', 'System'],
        body: ['Inter_400Regular', 'System'],
        'body-medium': ['Inter_500Medium', 'System'],
        'body-semibold': ['Inter_600SemiBold', 'System'],
        mono: ['JetBrainsMono_400Regular', 'monospace'],
      },
      borderRadius: {
        'l-xs': '6px',
        'l-sm': '10px',
        'l-md': '14px',
        'l-lg': '20px',
        'l-xl': '28px',
      },
    },
  },
  plugins: [],
};
