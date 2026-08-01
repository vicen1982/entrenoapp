/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': '#00ff9d',
        'neon-orange': '#ff6b2b',
        'neon-blue': '#00d4ff',
        'panel-bg': '#0a0f1e',
        'panel-card': '#0d1526',
        'panel-border': '#1a2540',
        'panel-surface': '#111827',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px #00ff9d, 0 0 10px #00ff9d' },
          '50%': { boxShadow: '0 0 20px #00ff9d, 0 0 40px #00ff9d' },
        },
        'scan': {
          '0%': { backgroundPosition: '0 -100%' },
          '100%': { backgroundPosition: '0 100%' },
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
