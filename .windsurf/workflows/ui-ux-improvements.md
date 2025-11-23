---
description: UI and UX Improvements
---

# UI/UX Improvements Overview

This update introduces a modern, card-based design system to the MoodFlow Mini Program.

## Key Changes

### 1. Global Styles (`app.wxss`)
- Introduced CSS variables for colors, spacing, and typography to ensure consistency.
- Added utility classes like `.card`, `.btn`, `.shadow-sm`, etc.

### 2. Icons
- Added a set of SVG icons in `assets/icons/` to replace text-based navigation.
- Icons include: `arrow-left`, `arrow-right`, `calendar`, `lock`, `plus`, `search`, `settings`, `stats`.

### 3. Calendar Page (`pages/calendar/`)
- **Design**: Completely redesigned with a clean, white-space oriented look.
- **Interaction**: 
  - Added a smooth bottom sheet for mood selection.
  - Replaced floating buttons with a modern bottom navigation bar.
  - Improved date grid visuals with better active/today states.
- **Logic**: Updated `index.js` to handle day selection and mood tracking more robustly.

### 4. Stats & Settings Pages
- Updated WXSS to use the new global variables and card styles.
- Improved spacing and touch targets for better usability.

## Maintenance

- **Adding Icons**: Place new SVG files in `assets/icons/`.
- **Theming**: Modify the CSS variables in `app.wxss` to change the global theme.
- **Dark Mode**: Ensure all new styles use the CSS variables which are overridden in `.theme-dark` classes.
