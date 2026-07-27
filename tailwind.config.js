export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    // Full screen set so the `xs:` utilities used throughout the app actually
    // generate. Defining `screens` (rather than `extend.screens`) keeps them in
    // ascending min-width order, so `sm:`/`md:` correctly override `xs:`.
    screens: {
      xs: '475px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      screens: {
        // Height-based variant for short viewports (landscape phones), e.g.
        // `short:text-5xl`, `short:py-2` to keep gameplay on-screen.
        short: { raw: '(max-height: 700px)' },
        tall: { raw: '(min-height: 900px)' },
      },
      // The single source of truth for the app's 9-tone palette. Use these
      // tokens (with Tailwind opacity modifiers, e.g. `text-mist/60`) instead
      // of Tailwind's built-in slate/gray/emerald/cyan scales.
      colors: {
        neon: {
          cyan: '#00F0FF', // Tone 1
          magenta: '#FF00AA', // Tone 2
          pink: '#FF4DB3', // Tone 3
          green: '#00FF88', // Tone 4
          amber: '#FFAA00', // Tone 5
          red: '#FF3355', // Tone 6
        },
        ink: {
          900: '#0A0A1A', // Tone 7 — base background
          800: '#111B35', // Tone 8 — elevated surface
        },
        mist: '#CBD5E1', // Tone 9 — neutral text / borders
      },
    },
  },
}
