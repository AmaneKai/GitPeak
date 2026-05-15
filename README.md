# GitPeek

A web application for viewing public GitHub profile statistics. Enter any GitHub username and get
an instant overview of their activity, languages, repositories, and contribution history.

Live at [gitpk.vercel.app](https://gitpk.vercel.app)

---

## Features

- Profile overview with avatar, bio, followers, and account age
- Contribution and commit totals
- Language distribution chart with per-language breakdown
- Most starred repository highlight
- Responsive layout for desktop and mobile
- Dynamic, animated SVG exporter for GitHub READMEs with built-in theme support

---

## Add to your GitHub README

You can embed your GitPeek dashboard directly into your GitHub profile `README.md`! It generates
an animated, auto-updating SVG of your GitHub stats.

Just copy and paste this code into your README, and replace `YOUR_USERNAME` with your actual
GitHub username:

```html
<div align="center">
	<a href="https://gitpk.vercel.app/?username=YOUR_USERNAME">
		<img src="https://gitpk.vercel.app/api/readme?username=YOUR_USERNAME" alt="My GitHub Stats" />
	</a>
</div>
```

### Themes

GitPeek supports 8 built-in themes. To change the look of your README card, simply add
`&theme=Theme+Name` to the end of the image URL.

For example, to use the **Catppuccin Mocha** theme:

```html
<img src="https://gitpk.vercel.app/api/readme?username=YOUR_USERNAME&theme=Catppuccin+Mocha" />
```

**Available Themes:**

- `Rosé+Pine` _(Default)_
- `Rosé+Pine+Moon`
- `Rosé+Pine+Dawn`
- `Catppuccin+Mocha`
- `Catppuccin+Latte`
- `Tokyo+Night`
- `Gruvbox+Dark`
- `Nord`

---

## Tech Stack

| Layer       | Technology                                      |
| ----------- | ----------------------------------------------- |
| Framework   | [SvelteKit](https://kit.svelte.dev/)            |
| Components  | [shadcn-svelte](https://www.shadcn-svelte.com/) |
| Headless UI | [bits-ui](https://www.bits-ui.com/)             |
| Styling     | [Tailwind CSS](https://tailwindcss.com/)        |
| Icons       | [Lucide](https://lucide.dev/)                   |
| Backend     | Cloudflare Worker proxying GitHub's GraphQL API |

---

## Project Structure

```text
src/
  lib/
    components/ui/     # shadcn component primitives
    features/
      charts/          # LanguagePie component and hook
      profile/         # ProfileCard component
      repos/           # MostStarredRepo component
      search/          # SearchBar, EmptyState, useSearch hook
      skeleton/        # DashboardSkeleton loading state
      stats/           # StatGrid component and hook
    utils/             # api, config, format, icons, theme, tilt, types
  routes/
    +page.svelte       # main page
    +layout.svelte     # app shell
    api/readme/        # Animated SVG generator for GitHub READMEs
    og/                # Static PNG Open Graph image generator
```

---

## License

MIT
