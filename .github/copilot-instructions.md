# GitHub Copilot Instructions

## Project Overview

This repository hosts a static GitHub Pages website for the conference **"Charting New Territory: Digital Humanities and AI in African Studies"**, funded by Volkswagen Foundation.

## Technology Stack

- **Framework**: SvelteKit with Svelte 5 (using runes syntax)
- **UI Library**: Flowbite Svelte
- **Styling**: Tailwind CSS with Flowbite plugin
- **Deployment**: GitHub Pages (static site generation)

## Code Generation Guidelines

### 1. Svelte 5 Syntax (Always Use Runes)

When writing Svelte components, ALWAYS use Svelte 5 runes syntax:

```svelte
<script lang="ts">
  // ✅ CORRECT - Use runes
  let count = $state(0);
  let doubled = $derived(count * 2);
  let { title, description } = $props();
  
  // ❌ INCORRECT - Don't use old syntax
  // let count = 0;
  // export let title;
  // $: doubled = count * 2;
</script>
```

**Key Svelte 5 Patterns:**
- `$state()` for reactive state
- `$derived()` for computed values
- `$props()` for component props
- `$effect()` for side effects (DOM manipulation, timers, etc.)
- `$bindable()` for two-way binding
- `{#snippet}` and `{@render}` for reusable markup instead of slots

### 2. Using MCP Tools

**For Svelte documentation:**
- Use the Svelte MCP server tools to get the latest Svelte 5 documentation
- Always verify component syntax with `mcp_svelte_list-sections` and `mcp_svelte_get-documentation`
- Use `mcp_svelte_svelte-autofixer` to validate Svelte code before presenting it

**For library documentation:**
- Use Context7 MCP tools (`mcp_context7_resolve-library-id` and `mcp_context7_get-library-docs`) for up-to-date documentation on Flowbite Svelte and other libraries

### 3. Flowbite Svelte Components

**Import Pattern:**
```svelte
<script lang="ts">
  import { Button, Card, Navbar, Footer } from 'flowbite-svelte';
  import { HomeOutline, CalendarOutline } from 'flowbite-svelte-icons';
</script>
```

**Component Usage:**
```svelte
<!-- Buttons with color variants -->
<Button color="primary">Register Now</Button>
<Button color="blue" outline>Learn More</Button>

<!-- Cards for content -->
<Card class="max-w-md">
  <h5 class="mb-2 text-2xl font-bold">Conference Title</h5>
  <p class="text-gray-700 dark:text-gray-400">Description...</p>
</Card>
```

### 4. Theming and Styling Best Practices

**Global CSS Configuration (app.css or global.css):**

```css
@import "tailwindcss";

@plugin 'flowbite/plugin';

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  /* Custom primary color (adapt to conference branding) */
  --color-primary-50: #fff5f2;
  --color-primary-100: #fff1ee;
  --color-primary-200: #ffe4de;
  --color-primary-300: #ffd5cc;
  --color-primary-400: #ffbcad;
  --color-primary-500: #fe795d;
  --color-primary-600: #ef562f;
  --color-primary-700: #eb4f27;
  --color-primary-800: #cc4522;
  --color-primary-900: #a5371b;

  /* Custom secondary color */
  --color-secondary-50: #f0f9ff;
  --color-secondary-100: #e0f2fe;
  --color-secondary-200: #bae6fd;
  --color-secondary-300: #7dd3fc;
  --color-secondary-400: #38bdf8;
  --color-secondary-500: #0ea5e9;
  --color-secondary-600: #0284c7;
  --color-secondary-700: #0369a1;
  --color-secondary-800: #075985;
  --color-secondary-900: #0c4a6e;
}

@source "../node_modules/flowbite-svelte/dist";
@source "../node_modules/flowbite-svelte-icons/dist";

@layer base {
  button, [role="button"] {
    cursor: pointer;
  }
}
```

**Using Theme Values:**
```svelte
<!-- Use custom colors in components -->
<Button color="primary">Primary Action</Button>
<Button color="secondary">Secondary Action</Button>

<!-- Apply Tailwind classes with custom colors -->
<div class="bg-primary-50 text-primary-900">
  Conference content
</div>
```

**ThemeProvider for Custom Component Styling:**
```svelte
<script lang="ts">
  import { ThemeProvider, Button, Card } from 'flowbite-svelte';
  
  const theme = {
    button: {
      base: "font-semibold",
      outline: "border-2"
    },
    card: {
      base: "shadow-lg"
    }
  };
</script>

<ThemeProvider {theme}>
  <!-- Components inherit theme -->
  <Button>Styled Button</Button>
</ThemeProvider>
```

### 5. Custom Component Wrapper Pattern

Create reusable themed components:

```svelte
<!-- src/lib/components/ConferenceButton.svelte -->
<script lang="ts">
  import { Button } from 'flowbite-svelte';
  let { children, ...props } = $props();
</script>

<Button color="primary" size="lg" class="font-bold uppercase" {...props}>
  {@render children()}
</Button>
```

### 6. Static Site Generation Configuration

**SvelteKit Configuration (svelte.config.js):**
```javascript
import adapter from '@sveltejs/adapter-static';

const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: undefined,
      precompress: false,
      strict: true
    }),
    paths: {
      base: process.env.NODE_ENV === 'production' ? '/dh-ai-african-studies-2026' : ''
    }
  }
};

export default config;
```

**Ensure all routes are prerenderable:**
```svelte
<script lang="ts">
  // +page.ts or +layout.ts
  export const prerender = true;
</script>
```

### 7. Accessibility Best Practices

- Always include meaningful alt text for images
- Use semantic HTML elements
- Ensure proper heading hierarchy (h1 → h2 → h3)
- Add ARIA labels to interactive elements
- Test keyboard navigation
- Maintain sufficient color contrast ratios

```svelte
<!-- Good accessibility example -->
<nav aria-label="Main navigation">
  <Navbar>
    <NavBrand href="/">
      <img src="/logo.png" alt="Conference logo" class="h-8" />
      <span class="sr-only">Conference Home</span>
    </NavBrand>
  </Navbar>
</nav>
```

### 8. File Structure

```
src/
├── lib/
│   ├── components/     # Reusable components
│   ├── assets/         # Images, fonts, etc.
│   └── utils/          # Helper functions
├── routes/
│   ├── +layout.svelte  # Global layout
│   ├── +page.svelte    # Homepage
│   ├── about/          # About page
│   ├── schedule/       # Schedule page
│   ├── speakers/       # Speakers page
│   └── register/       # Registration page
└── app.css             # Global styles
```

### 9. Common Component Patterns

**Navigation:**
```svelte
<script lang="ts">
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
  import { page } from '$app/state';
  
  let activeUrl = $derived(page.url.pathname);
</script>

<Navbar>
  <NavBrand href="/">Conference 2026</NavBrand>
  <NavHamburger />
  <NavUl {activeUrl}>
    <NavLi href="/">Home</NavLi>
    <NavLi href="/schedule">Schedule</NavLi>
    <NavLi href="/speakers">Speakers</NavLi>
  </NavUl>
</Navbar>
```

**Footer:**
```svelte
<script lang="ts">
  import { Footer, FooterCopyright, FooterLinkGroup, FooterLink } from 'flowbite-svelte';
</script>

<Footer>
  <FooterCopyright by="Volkswagen Foundation" />
  <FooterLinkGroup>
    <FooterLink href="/about">About</FooterLink>
    <FooterLink href="/contact">Contact</FooterLink>
  </FooterLinkGroup>
</Footer>
```

### 10. TypeScript Usage

Always use TypeScript for type safety:

```svelte
<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { Button } from 'flowbite-svelte';
  
  interface Speaker {
    name: string;
    title: string;
    bio: string;
    image: string;
  }
  
  let speakers: Speaker[] = $state([]);
  let selectedSpeaker: Speaker | null = $state(null);
</script>
```

### 11. Dark Mode Support

```svelte
<script lang="ts">
  import { DarkMode } from 'flowbite-svelte';
</script>

<!-- Add dark mode toggle -->
<DarkMode class="text-primary-500 dark:text-primary-600" />

<!-- Style for both modes -->
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content adapts to theme
</div>
```

## Code Quality Standards

1. **Always validate Svelte code** with MCP Svelte tools before finalizing
2. **Use TypeScript** for all new files
3. **Follow accessibility guidelines** (WCAG 2.1 Level AA)
4. **Maintain consistent formatting** with Prettier
5. **Use semantic HTML** and proper component structure
6. **Document complex components** with JSDoc comments
7. **Test responsive behavior** at multiple breakpoints
8. **Optimize images** and assets for web delivery
9. **Use meaningful commit messages** following conventional commits

## Conference-Specific Considerations

- Emphasize **academic and professional** design aesthetics
- Include **Volkswagen Foundation branding** where appropriate
- Ensure content is **accessible and inclusive**
- Support **multiple languages** if needed (use i18n patterns)
- Optimize for **information density** (schedules, speaker bios, abstracts)
- Include **call-to-action elements** (registration, submission deadlines)

## Resources

- Svelte 5 Documentation: Use MCP Svelte tools
- Flowbite Svelte: Use Context7 MCP tools with library ID `/themesberg/flowbite-svelte`
- Tailwind CSS: https://tailwindcss.com/docs
- GitHub Pages: https://pages.github.com/

---

**Remember**: Always use the latest documentation through MCP tools, and validate all Svelte code with `mcp_svelte_svelte-autofixer` before presenting solutions.
