#!/usr/bin/env node

/**
 * analyze-frontend.mjs
 *
 * Collects frontend configuration and design token information from a Laravel
 * project. Outputs structured JSON for an AI agent to interpret.
 *
 * Usage: node analyze-frontend.mjs [project-root]
 *        Defaults to current working directory if no argument provided.
 *
 * Exit code 0 always (outputs valid JSON). Warnings go to stderr.
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, resolve, extname } from "node:path";

const root = resolve(process.argv[2] || process.cwd());

function warn(msg) {
  process.stderr.write(`[analyze-frontend] ${msg}\n`);
}

function readFileOrNull(filePath) {
  try {
    return readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function findFirst(dir, candidates) {
  for (const name of candidates) {
    const full = join(dir, name);
    if (existsSync(full)) return { path: name, content: readFileOrNull(full) };
  }
  return null;
}

function countFiles(dir, extensions) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return 0;
  let count = 0;
  try {
    for (const entry of readdirSync(dir, { recursive: true })) {
      if (extensions.some((ext) => entry.endsWith(ext))) count++;
    }
  } catch {
    /* permission or read error */
  }
  return count;
}

function extractCssCustomProperties(cssContent) {
  const props = {};
  const re = /--([\w-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = re.exec(cssContent)) !== null) {
    props[`--${match[1]}`] = match[2].trim();
  }
  return props;
}

// --- Detect stack from package.json ---

let packageJson = null;
const packageRaw = readFileOrNull(join(root, "package.json"));
if (packageRaw) {
  try {
    packageJson = JSON.parse(packageRaw);
  } catch {
    warn("Could not parse package.json");
  }
}

const allDeps = {
  ...(packageJson?.dependencies || {}),
  ...(packageJson?.devDependencies || {}),
};
const depNames = Object.keys(allDeps);

function hasDep(name) {
  return depNames.some((d) => d === name || d.startsWith(`${name}/`));
}

const framework = hasDep("vue")
  ? "vue"
  : hasDep("react") || hasDep("react-dom")
    ? "react"
    : hasDep("svelte")
      ? "svelte"
      : hasDep("alpinejs")
        ? "alpine"
        : hasDep("livewire") // rarely in package.json but check anyway
          ? "livewire"
          : "unknown";

const css = hasDep("tailwindcss")
  ? "tailwind"
  : hasDep("bootstrap")
    ? "bootstrap"
    : hasDep("sass") || hasDep("sass-embedded")
      ? "custom-scss"
      : "unknown";

const buildTool = hasDep("vite") || hasDep("laravel-vite-plugin")
  ? "vite"
  : hasDep("webpack") || hasDep("laravel-mix")
    ? hasDep("laravel-mix")
      ? "mix"
      : "webpack"
    : "unknown";

// --- Categorize installed packages ---

const categories = { frontend: [], icons: [], animation: [], ui: [] };

const iconPkgs = [
  "heroicons",
  "@heroicons/vue",
  "@heroicons/react",
  "lucide",
  "lucide-vue-next",
  "lucide-react",
  "@phosphor-icons",
  "react-icons",
  "@tabler/icons",
  "@iconify",
];
const animPkgs = ["motion", "framer-motion", "gsap", "animejs", "auto-animate", "@formkit/auto-animate"];
const uiPkgs = [
  "@headlessui/vue",
  "@headlessui/react",
  "@radix-ui",
  "primevue",
  "vuetify",
  "@mui/material",
  "shadcn",
  "flowbite",
  "daisyui",
  "preline",
];

for (const dep of depNames) {
  if (iconPkgs.some((p) => dep === p || dep.startsWith(`${p}/`))) {
    categories.icons.push(dep);
  } else if (animPkgs.some((p) => dep === p || dep.startsWith(`${p}/`))) {
    categories.animation.push(dep);
  } else if (uiPkgs.some((p) => dep === p || dep.startsWith(`${p}/`))) {
    categories.ui.push(dep);
  } else if (
    [
      "vue",
      "react",
      "react-dom",
      "svelte",
      "alpinejs",
      "tailwindcss",
      "bootstrap",
      "sass",
      "sass-embedded",
      "postcss",
      "@inertiajs/vue3",
      "@inertiajs/react",
      "vite",
      "laravel-vite-plugin",
      "laravel-mix",
      "typescript",
      "axios",
    ].includes(dep)
  ) {
    categories.frontend.push(dep);
  }
}

// --- Config files ---

const configFiles = {
  tailwindConfig: findFirst(root, [
    "tailwind.config.js",
    "tailwind.config.ts",
    "tailwind.config.mjs",
    "tailwind.config.cjs",
  ]),
  postcssConfig: findFirst(root, [
    "postcss.config.js",
    "postcss.config.ts",
    "postcss.config.mjs",
    "postcss.config.cjs",
  ]),
  viteConfig: findFirst(root, [
    "vite.config.js",
    "vite.config.ts",
    "vite.config.mjs",
  ]),
  webpackConfig: findFirst(root, ["webpack.mix.js", "webpack.config.js"]),
};

// --- CSS custom properties ---

const cssDir = join(root, "resources", "css");
const cssCustomProperties = [];

if (existsSync(cssDir) && statSync(cssDir).isDirectory()) {
  try {
    for (const file of readdirSync(cssDir, { recursive: true })) {
      if (file.endsWith(".css") || file.endsWith(".scss") || file.endsWith(".less")) {
        const content = readFileOrNull(join(cssDir, file));
        if (content) {
          const props = extractCssCustomProperties(content);
          if (Object.keys(props).length > 0) {
            cssCustomProperties.push({ file: `resources/css/${file}`, properties: props });
          }
        }
      }
    }
  } catch {
    warn("Could not read CSS directory");
  }
}

// --- Component directories ---

const componentDirs = [
  "resources/js/Components",
  "resources/js/components",
  "resources/js/Pages",
  "resources/js/pages",
  "resources/views/components",
  "resources/views/livewire",
];

const componentDirectories = [];
for (const rel of componentDirs) {
  const abs = join(root, rel);
  if (existsSync(abs) && statSync(abs).isDirectory()) {
    const exts = [".vue", ".jsx", ".tsx", ".blade.php", ".svelte"];
    const count = countFiles(abs, exts);
    componentDirectories.push({ path: rel, count });
  }
}

// --- Existing design artifacts ---

const designArtifactPatterns = [
  ".ai/skills/project-design/SKILL.md",
  ".ai/design-guide.md",
  "docs/design-guide.md",
  "docs/design-system.md",
  "design-guide.md",
  "DESIGN.md",
];

const existingDesignArtifacts = designArtifactPatterns.filter((p) =>
  existsSync(join(root, p))
);

// --- Livewire detection (not always in package.json) ---

const livewireDetected =
  existsSync(join(root, "resources/views/livewire")) ||
  existsSync(join(root, "app/Livewire")) ||
  existsSync(join(root, "app/Http/Livewire"));

const detectedFramework =
  framework === "unknown" && livewireDetected ? "livewire" : framework;

// --- Output ---

const result = {
  projectRoot: root,
  stack: {
    framework: detectedFramework,
    css,
    buildTool,
    inertia: hasDep("@inertiajs/vue3") || hasDep("@inertiajs/react"),
  },
  configFiles,
  cssCustomProperties,
  componentDirectories,
  existingDesignArtifacts,
  packages: categories,
};

process.stdout.write(JSON.stringify(result, null, 2) + "\n");
