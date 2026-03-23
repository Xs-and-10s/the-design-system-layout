# Changelog

All notable changes to `@design-system/layout` are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Core CSS: layer declaration, design tokens, minimal reset, base styles
- Core JS: element factory (`createDesignSystemLayoutElement`), normalizers, DOM helpers
- Ratio system: full musical interval set (minor-second through octave) + metallic ratios (golden, silver, bronze)
- Fluid ratio: `--ds-ratio` interpolates between `--ds-ratio-min` and `--ds-ratio-max` across viewport width
- 11-step space scale (tiny → xxxl → huge) with adjacent half-step pairs and inverse scale
- Typographic scale tokens (`--ds-text-*`) driven by `--ds-text-ratio`
- Semantic color slot tokens with system color defaults
- `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs
- `ds.motion` layer with global reduced-motion override
- Build pipeline: LightningCSS (CSS), tsc (readable JS + types), Bun.build (minified JS)
