# Privy.io-Inspired Design System Rules

This document outlines the design principles and guidelines for the Zelf Dashboard, inspired by the clean, modern aesthetic of Privy.io. Use these rules when creating or updating UI components to ensure consistency.

## 1. Layout & Structure

### Page Containers

- **Background:** Use a light, subtle background for the page to make cards pop.
    - Light: `bg-gray-50/50`
    - Dark: `dark:bg-gray-900`
- **Content Width:** generally centered or max-width constrained for readability.
    - Example: `max-w-4xl mx-auto` for settings pages.

### Cards

Cards are the primary container for content.

- **Shape:** heavily rounded corners.
    - Class: `rounded-3xl`
- **Shadow:** soft, elevated shadows.
    - Class: `shadow-xl`
- **Background:**
    - Light: `bg-white`
    - Dark: `dark:bg-slate-800`
- **Borders:** subtle borders for definition.
    - Class: `border border-gray-100 dark:border-gray-700/50`
- **Padding:** generous padding to let content breathe.
    - Class: `p-8` or `p-8 sm:p-10`

## 2. Typography

- **Headings:** Bold, clear, and high contrast.
    - H1/Page Titles: `text-2xl font-bold text-gray-900 dark:text-white`
    - Section Titles: `text-xl font-bold`
- **Body Text:**
    - Standard: `text-gray-600 dark:text-gray-300`
    - Subtext/Hints: `text-sm text-gray-500 dark:text-gray-400`
- **Labels:** Small, uppercase or font-semibold labels for forms.
    - Class: `text-sm font-semibold text-gray-700 dark:text-gray-300`

## 3. Form Elements

### Inputs

Avoid default browser borders or heavy Material Design wrappers if possible. Use specific Tailwind classes for a custom "clean" look.

- **Container:** Wrap inputs in a `div` that handles the border/ring.
    - Class: `bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl`
- **Focus State:** Apply ring to the container, not just the input.
    - Class: `focus-within:ring-2 focus-within:ring-gray-900 dark:focus-within:ring-gray-100` (Monochrome focus)
    - Or Brand Color: `focus-within:ring-blue-500`
- **Input Field:** Transparent background, no border, clean text.
    - Class: `bg-transparent border-none focus:ring-0 w-full py-3 px-4`

### Buttons

- **Primary Action:** High contrast, rounded.
    - Class: `bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-gray-800` (Light mode inverse)
    - Dark Mode: `dark:bg-white dark:text-gray-900`
- **Secondary/Cancel:** Subtle.
    - Class: `text-gray-600 hover:text-gray-900` or `border border-gray-200 rounded-xl`

### Toggles & Checkboxes

- Use uniform colors (e.g., green for enabled, gray for disabled) consistent with the platform.

## 4. Visual Elements

### Icons

- Use `mat-icon` but styled with Tailwind.
- **Container:** often inside a rounded circle with a colored background.
    - Example: `w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center`

### Dividers

- Subtle lines.
    - Class: `h-px bg-gray-100 dark:bg-gray-700`

### Animations

- Use `animate-fade-in` for smooth entrance of elements.
- Transitions: `transition-all duration-200` on interactive elements.

## 5. Specific Patterns

### "Domain Input" Style

For inputs that represent a URL or specific format:

- **Structure:** `[ Static Prefix ] [ Input Field ] [ Static Suffix ]`
- **Container:** Single rounded border enclosing all parts.
- **Prefix/Suffix:** Gray text, non-editable.
- **Input:** bold/semibold text to highlight user entry.

### Sticky Action Bars

For long forms (like settings):

- Stick to bottom of viewport.
- Backdrop blur.
    - Class: `sticky bottom-6 bg-gray-900/90 backdrop-blur-md rounded-2xl p-4 text-white`

## 6. Color Palette Guidance

- **Gray Scale:** Use `slate` or cool grays for dark mode (`bg-slate-800`).
- **Accents:**
    - Blue: Primary actions, info.
    - Green: Success, active states, money/payments.
    - Orange: Warnings, system/readonly info.
    - Red: Errors, destructive actions.

---

_Created: December 2025_
