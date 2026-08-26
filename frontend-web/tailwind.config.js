/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Identidade BRABUS BARBER: garagem + barbearia clássica
        ink: {
          DEFAULT: '#101012', // fundo principal, preto levemente quente
          soft: '#18181b',
          surface: '#1f1e1c',
        },
        brass: {
          DEFAULT: '#C9A24B', // latão escovado — acento principal
          light: '#E0C27A',
          dark: '#8F7130',
        },
        oxblood: {
          DEFAULT: '#8C2F2F', // vermelho poste de barbeiro — acento secundário
          light: '#B14545',
        },
        bone: {
          DEFAULT: '#F3EFE8', // texto principal sobre fundo escuro
          muted: '#9B968D',
        },
      },
      fontFamily: {
        display: ['var(--font-oswald)', 'sans-serif'],
        body: ['var(--font-work-sans)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundImage: {
        'diagonal-stripes':
          'repeating-linear-gradient(45deg, var(--tw-gradient-stops))',
      },
      letterSpacing: {
        widest2: '0.25em',
      },
    },
  },
  plugins: [],
};
