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
  blue:   { light: { f: 600, b: 100 }, dark: { f: 900, b: 900 } },
  yellow: { light: { f: 600, b: 100 }, dark: { f: 900, b: 900 } },
  rose:   { light: { f: 600, b: 100 }, dark: { f: 900, b: 900 } },
  purple: { light: { f: 600, b: 100 }, dark: { f: 900, b: 900 } },
  orange: { light: { f: 600, b: 100 }, dark: { f: 900, b: 900 } },
  green:  { light: { f: 600, b: 100 }, dark: { f: 900, b: 900 } },
};

export function t(
  prefix: string,
  theme: Theme = fallbackTheme,
  type: "b" | "f" = "b"
): string {
  const codes = THEME_CODES[theme] || THEME_CODES[fallbackTheme];
  const lightCode = codes.light[type];
  const darkCode = codes.dark[type];

  return `${prefix}-${theme}-${lightCode} dark:${prefix}-${theme}-${darkCode}`;
}

export const tailwindColorSafelist: string[] = themeOptions.flatMap(theme =>
  Array.from({ length: 10 }, (_, i) => {
    const shade = (i + 1) * 100;
    return [`text-${theme}-${shade}`, `bg-${theme}-${shade}`, `dark:bg-${theme}-${shade}`];
  }).flat()
);