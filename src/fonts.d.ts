// @fontsource/big-shoulders-display only resolves through its "./*" export
// (".../700", not ".../700.css"), which TypeScript can't type-check as CSS.
declare module "@fontsource/big-shoulders-display/*";
