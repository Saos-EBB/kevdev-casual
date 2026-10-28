// kev.dev Casual: Kevin as the product. Each module wires up its own part of
// the markup in index.html. Fonts ship locally, no request to Google Fonts.
import "@fontsource-variable/gabarito";
import "@fontsource-variable/onest";
import "@fontsource-variable/martian-mono";
// Only for the Zirbn sketch on its demo card.
import "@fontsource/bagel-fat-one";
import "./style.css";
import "./ui";
import { mountCards } from "./cards";
import { mountDemoArt } from "./demo-art";
import { mountDots } from "./dots";

// Reveal styles only apply once JS runs, so the page is complete without it.
document.documentElement.classList.add("js");

mountCards();
mountDemoArt();
mountDots();
