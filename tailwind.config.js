/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': '#2ee6a8',
        'neon-orange': '#fb923c',
        'neon-blue': '#38bdf8',
        'panel-bg': '#0b0f17',
        'panel-card': '#111927',
        'panel-border': '#1e2a3d',
        'panel-surface': '#182233',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px #2ee6a8, 0 0 10px #2ee6a8' },
          '50%': { boxShadow: '0 0 20px #2ee6a8, 0 0 40px #2ee6a8' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  safelist: [
    'text-neon-green', 'text-neon-orange', 'text-neon-blue',
    'text-yellow-400', 'text-red-400', 'text-red-500',
    'bg-neon-green', 'bg-neon-orange', 'bg-neon-blue',
    'bg-neon-green/10', 'bg-neon-orange/10', 'bg-neon-blue/10',
    'bg-neon-green/5', 'bg-neon-orange/5', 'bg-neon-blue/5',
    'bg-neon-green/20', 'bg-neon-orange/20', 'bg-neon-blue/20',
    'bg-red-500/10', 'bg-red-500/5',
    'border-neon-green', 'border-neon-orange', 'border-neon-blue',
    'border-neon-green/30', 'border-neon-orange/30', 'border-neon-blue/30',
    'border-neon-green/40', 'border-neon-orange/40', 'border-neon-blue/40',
    'border-neon-green/50', 'border-neon-orange/50', 'border-neon-blue/50',
    'border-neon-green/25', 'border-red-500/20', 'border-red-500/30',
    'glow-green', 'glow-orange', 'glow-blue',
    'text-glow-green', 'text-glow-orange', 'text-glow-blue',
    'panel-border-green', 'panel-border-orange', 'panel-border-blue',
  ],
  plugins: [],
}
