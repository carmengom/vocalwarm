---
name: Nocturne Serenade
colors:
  surface: '#141218'
  surface-dim: '#141218'
  surface-bright: '#3b383f'
  surface-container-lowest: '#0f0d13'
  surface-container-low: '#1d1a21'
  surface-container: '#211e25'
  surface-container-high: '#2b292f'
  surface-container-highest: '#36333a'
  on-surface: '#e7e0e9'
  on-surface-variant: '#cac4d4'
  inverse-surface: '#e7e0e9'
  inverse-on-surface: '#322f36'
  outline: '#948e9d'
  outline-variant: '#494552'
  surface-tint: '#cebdff'
  primary: '#cebdff'
  on-primary: '#381286'
  primary-container: '#6b4fbb'
  on-primary-container: '#e5d9ff'
  inverse-primary: '#674bb7'
  secondary: '#cebdff'
  on-secondary: '#371682'
  secondary-container: '#4e3299'
  on-secondary-container: '#bda8ff'
  tertiary: '#cdc0ea'
  on-tertiary: '#342b4c'
  tertiary-container: '#675d82'
  on-tertiary-container: '#e6d9ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e8ddff'
  primary-fixed-dim: '#cebdff'
  on-primary-fixed: '#21005e'
  on-primary-fixed-variant: '#4f319d'
  secondary-fixed: '#e8ddff'
  secondary-fixed-dim: '#cebdff'
  on-secondary-fixed: '#20005e'
  on-secondary-fixed-variant: '#4e3299'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#cdc0ea'
  on-tertiary-fixed: '#1f1636'
  on-tertiary-fixed-variant: '#4b4164'
  background: '#141218'
  on-background: '#e7e0e9'
  surface-variant: '#36333a'
typography:
  display-lg:
    fontFamily: Epilogue
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Epilogue
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Epilogue
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  margin-mobile: 24px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

This design system is built to evoke the atmosphere of a private, high-end rehearsal studio at twilight. The brand personality is that of an expert mentor—authoritative and professional, yet deeply personal and encouraging. 

The aesthetic blends **Modern Minimalism** with subtle **Glassmorphism**. We prioritize negative space to reduce cognitive load during practice, using light and shadow not just for depth, but to simulate the biological resonance of the human voice. The interface should feel "alive" through the use of soft glows and organic transitions, moving away from cold, clinical utility toward a more artisanal, premium digital experience.

## Colors

The palette is anchored in a deep, nocturnal spectrum. The primary violet (#6B4FBB) serves as the "voice" of the UI, used for key actions and active states. A secondary lighter violet (#A389F4) provides necessary highlights and interactive feedback.

The background isn't a flat black; it is a rich, deep ink (#0F0D13) that allows the purple tones to vibrate. Surface colors use a tertiary deep plum (#2D2445) to create logical separation. Text utilizes high-contrast white for primary information and a soft gray-lavender for secondary metadata to ensure long-term legibility during low-light vocal sessions.

## Typography

This design system employs a sophisticated dual-type strategy. For headings, **Epilogue** provides an artisanal, editorial flair with its distinctive geometric construction, lending a sense of "craft" to the coaching experience. 

For functional text and body copy, **Manrope** offers a highly legible, refined sans-serif experience. Its modern proportions ensure that technical instructions are easy to read at a glance while a singer is focused on their posture and breathing. We utilize generous line-heights and tight letter-spacing on headlines to maintain a premium, rhythmic feel.

## Layout & Spacing

The layout philosophy emphasizes "the luxury of space." We follow a **fluid grid** model rooted in an 8px base unit, but we intentionally push the outer margins to 24px to give the content a centered, focused presence. 

Vertical rhythm is crucial; sections are separated by large "breathable" gaps (stack-lg) to mirror the phrasing of a song. Components should never feel cramped; padding within cards and containers is generous to maintain the "high-end" minimalist aesthetic.

## Elevation & Depth

Hierarchy is established through **tonal layers** and **ambient glows**. Rather than traditional drop shadows, this design system utilizes "diffusion glows"—soft, low-opacity shadows tinted with the primary violet color.

1.  **Base Layer:** The deepest background (#0F0D13).
2.  **Surface Layer:** Slightly elevated containers using #2D2445 with a subtle 1px border at 10% opacity white.
3.  **Interactive Layer:** Elements that float above the surface, using backdrop blurs (12px to 20px) and a primary-colored outer glow to indicate activity or focus.

This approach creates a sense of "luminosity," as if the interface is back-lit, mimicking the stage lighting of a professional performance.

## Shapes

The shape language is consistently **Rounded** to feel approachable and ergonomic. Standard UI components like input fields and small buttons use a 0.5rem (8px) radius. Larger container elements and song artwork cards utilize a 1rem (16px) radius to create a soft, contemporary silhouette. Full "pill" shapes are reserved exclusively for tags and status indicators to provide a distinct visual departure from interactive buttons.

## Components

### Buttons
Primary buttons are solid #6B4FBB with white text, featuring a subtle inner-top highlight to create a tactile, "pressed" feel. Secondary buttons use a ghost style with a 1px border of the primary color.

### Song & Lesson Cards
These are the centerpiece of the experience. They feature high-resolution artwork with a subtle 20px primary-tinted ambient glow behind them. Text is overlaid using a bottom-to-top dark gradient for readability.

### Progress Rings
For vocal exercises, use thin-stroke circular progress indicators. The track should be the tertiary color, and the progress should be a gradient from Primary to Secondary violet.

### Inputs
Search and text inputs use the Surface Layer color (#2D2445) with a 0.5rem radius. When focused, the border transitions to the Primary violet with a soft outer glow.

### Minimalist Iconography
Use thin-stroke linear icons (2px weight) with rounded terminals. Icons should be monochrome light gray, turning primary violet only when active.