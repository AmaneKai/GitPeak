const SIMPLE_ICONS: Readonly<Record<string, string>> = {
	TypeScript: "typescript",
	JavaScript: "javascript",
	Python: "python",
	Rust: "rust",
	Go: "go",
	Ruby: "ruby",
	Kotlin: "kotlin",
	Swift: "swift",
	C: "c",
	"C++": "cplusplus",
	"C#": "csharp",
	PHP: "php",
	Dart: "dart",
	Scala: "scala",
	Elixir: "elixir",
	Haskell: "haskell",
	Lua: "lua",
	Shell: "gnubash",
	Bash: "gnubash",
	HTML: "html5",
	CSS: "css",
	SCSS: "sass",
	Sass: "sass",
	Vue: "vuedotjs",
	Svelte: "svelte",
	Astro: "astro",
	Dockerfile: "docker",
	Nix: "nixos",
	Zig: "zig",
	Clojure: "clojure",
	Erlang: "erlang",
	R: "r",
	Julia: "julia",
	Perl: "perl",
	OCaml: "ocaml",
	"F#": "fsharp",
	Groovy: "apachegroovy",
	Markdown: "markdown",
} as const

const DIRECT_ICONS: Readonly<Record<string, string>> = {
	Java: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
} as const

export function langIconUrl(name: string): string {
	if (DIRECT_ICONS[name]) return DIRECT_ICONS[name]
	const slug = SIMPLE_ICONS[name]
	return slug ? `https://cdn.simpleicons.org/${slug}` : ""
}

export function hideImgOnError(e: Event): void {
	const img = e.currentTarget as HTMLImageElement
	img.style.display = "none"
	const fallback = img.nextElementSibling as HTMLElement | null
	if (fallback) fallback.style.display = "block"
}
