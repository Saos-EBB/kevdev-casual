// kev.dev Casual: one warm scroll page. Each module wires up its own part of
// the markup in index.html.
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/figtree";
import "@fontsource-variable/jetbrains-mono";
// Fonts of the YourBrand tenants, used in the tenant demo only.
import "@fontsource-variable/dm-sans";
import "@fontsource/archivo/500.css";
import "@fontsource/archivo/800.css";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "@fontsource/big-shoulders-display/700";
import "@fontsource/big-shoulders-display/900";
import "./style.css";

// Reveal styles only apply once JS runs, so the page is complete without it.
document.documentElement.classList.add("js");

import "./ui";
import "./hero";
import "./tenants";
import "./workshop";
