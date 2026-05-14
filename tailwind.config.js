/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        "tertiary-fixed": "#e9ddff",
        "surface-tint": "#cebdff",
        "on-secondary-fixed": "#20005e",
        "secondary-container": "#4e3299",
        "on-primary-fixed": "#21005e",
        "outline": "#948e9d",
        "on-tertiary-fixed": "#1f1636",
        "on-background": "#e7e0e9",
        "tertiary-container": "#675d82",
        "surface": "#141218",
        "on-tertiary": "#342b4c",
        "outline-variant": "#494552",
        "on-primary": "#381286",
        "inverse-on-surface": "#322f36",
        "surface-container-high": "#2b292f",
        "secondary-fixed-dim": "#cebdff",
        "background": "#141218",
        "surface-container": "#211e25",
        "on-secondary": "#371682",
        "primary-container": "#6b4fbb",
        "primary": "#cebdff",
        "on-secondary-fixed-variant": "#4e3299",
        "tertiary": "#cdc0ea",
        "surface-variant": "#36333a",
        "surface-container-lowest": "#0f0d13",
        "secondary": "#cebdff",
        "tertiary-fixed-dim": "#cdc0ea",
        "on-surface": "#e7e0e9",
        "on-tertiary-fixed-variant": "#4b4164",
        "primary-fixed": "#e8ddff",
        "surface-container-low": "#1d1a21",
        "secondary-fixed": "#e8ddff",
        "on-tertiary-container": "#e6d9ff",
        "inverse-primary": "#674bb7",
        "surface-bright": "#3b383f",
        "inverse-surface": "#e7e0e9",
        "on-primary-fixed-variant": "#4f319d",
        "on-error": "#690005",
        "primary-fixed-dim": "#cebdff",
        "on-error-container": "#ffdad6",
        "on-surface-variant": "#cac4d4",
        "surface-container-highest": "#36333a",
        "error-container": "#93000a",
        "on-secondary-container": "#bda8ff",
        "error": "#ffb4ab",
        "on-primary-container": "#e5d9ff",
        "surface-dim": "#141218"
      },
      "borderRadius": {
        "DEFAULT": "0.5rem",
        "sm": "0.25rem",
        "md": "0.75rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
      "spacing": {
        "unit": "8px",
        "gutter": "16px",
        "stack-sm": "12px",
        "margin-mobile": "24px",
        "stack-md": "24px",
        "stack-lg": "48px"
      },
      "fontFamily": {
        "headline-md": ["Epilogue"],
        "body-md": ["Manrope"],
        "body-lg": ["Manrope"],
        "display-lg": ["Epilogue"],
        "label-sm": ["Manrope"],
        "headline-lg": ["Epilogue"]
      },
      "fontSize": {
        "headline-md": ["22px", { "lineHeight": "28px", "fontWeight": "500" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
        "display-lg": ["40px", { "lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "headline-lg": ["28px", { "lineHeight": "36px", "fontWeight": "600" }]
      }
    },
  },
  plugins: [
    require('@tailwindcss/container-queries')
  ],
}
