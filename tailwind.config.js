module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: 'rgb(var(--terminal-bg) / <alpha-value>)',
          surface: 'rgb(var(--terminal-surface) / <alpha-value>)',
          border: 'rgb(var(--terminal-border) / <alpha-value>)',
          borderHover: 'rgb(var(--terminal-borderHover) / <alpha-value>)',
          muted: 'rgb(var(--terminal-muted) / <alpha-value>)',
          text: 'rgb(var(--terminal-text) / <alpha-value>)',
          heading: 'rgb(var(--terminal-heading) / <alpha-value>)',
          prompt: 'rgb(var(--terminal-prompt) / <alpha-value>)',
          accent: 'rgb(var(--terminal-accent) / <alpha-value>)',
          green: 'rgb(var(--terminal-green) / <alpha-value>)',
          red: 'rgb(var(--terminal-red) / <alpha-value>)',
          cyan: 'rgb(var(--terminal-cyan) / <alpha-value>)',
          purple: 'rgb(var(--terminal-purple) / <alpha-value>)',
          amber: 'rgb(var(--terminal-amber) / <alpha-value>)',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
