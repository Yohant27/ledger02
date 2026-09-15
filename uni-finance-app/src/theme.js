export const COLORS = {
  ink: "#16213A",
  paper: "#EDEFE7",
  paperDim: "#E2E4DA",
  gold: "#C98A3E",
  teal: "#3F7D6E",
  brick: "#B4483F",
  line: "rgba(22,33,58,0.14)",
  lineSoft: "rgba(22,33,58,0.08)",
};

export const FONT_VOICE = "'Spectral', Georgia, 'Times New Roman', serif";
export const FONT_MONO = "'IBM Plex Mono', SFMono-Regular, Menlo, Consolas, monospace";
export const FONT_UI = "system-ui, -apple-system, 'Segoe UI', sans-serif";

export function fmt(n) {
  const v = Math.round(n * 100) / 100;
  return v.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
