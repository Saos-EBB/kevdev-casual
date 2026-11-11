// kev.dev Casual: Kevin as the product. Each module wires up its own part of
// the markup in index.html. Fonts ship locally, no request to Google Fonts.
import "@fontsource-variable/onest";
import "@fontsource-variable/martian-mono";
import "./style.css";
import "./ui";
import { mountCards } from "./cards";
import { mountDots } from "./dots";

// Reveal styles only apply once JS runs, so the page is complete without it.
document.documentElement.classList.add("js");

mountCards();
mountDots();
