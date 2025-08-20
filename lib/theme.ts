export type Theme = typeof themeOptions[number];

export const themeOptions = ["blue", "yellow", "rose", "purple", "orange", "green"];

export const fallbackTheme = "blue";

// f -> foreground, b -> background
const THEME_CODES: Record<
  Theme,
  {
    light: { f: number; b: number };
    dark: { f: number; b: number };
  }
> = {
  blue:   { light: { f: 600, b: 100 }, dark: { f: 500, b: 950 } },
  yellow: { light: { f: 600, b: 100 }, dark: { f: 700, b: 950 } },
  rose:   { light: { f: 600, b: 100 }, dark: { f: 600, b: 950 } },
  purple: { light: { f: 600, b: 100 }, dark: { f: 600, b: 950 } },
  orange: { light: { f: 600, b: 100 }, dark: { f: 700, b: 950 } },
  green:  { light: { f: 600, b: 100 }, dark: { f: 700, b: 950 } },
};

export function t(
  prefix: string,
  theme: Theme = fallbackTheme,
  type: "b" | "f" = "b",
  mode?: "light" | "dark"
): string {
  const codes = THEME_CODES[theme] || THEME_CODES[fallbackTheme];
  const lightCode = codes.light[type];
  const darkCode = codes.dark[type];

  if (mode === "light") {
    return `${prefix}-${theme}-${lightCode}`;
  } else if (mode === "dark") {
    return `${prefix}-${theme}-${darkCode}`;
  }

  return `${prefix}-${theme}-${lightCode} dark:${prefix}-${theme}-${darkCode}`;
}

export const tailwindColorSafelist: string[] = themeOptions.flatMap(theme =>
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].flatMap(shade => [
    `text-${theme}-${shade}`,
    `bg-${theme}-${shade}`,
    `dark:bg-${theme}-${shade}`
  ])
);