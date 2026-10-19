// Small helpers shared by every module.
export const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T;
export const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
export const css = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
export const DPR = Math.min(2, window.devicePixelRatio || 1);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
