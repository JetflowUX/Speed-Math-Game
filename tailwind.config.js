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
    },
  },
}
