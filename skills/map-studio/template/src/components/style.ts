import { loadFont } from "@remotion/google-fonts/NotoSansThai";

const { fontFamily } = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["thai", "latin"] });

// The locked channel style. Copy project/style.json values here (or import the JSON) once the user approves.
export type Style = {
  bg: string;
  ocean: string;
  land: string;
  border: string;
  graticule: string;
  highlight: string;
  accent: string;
  text: string;
  textStroke: string;
  font: string;
};

export const style: Style = {
  bg: "#06101f",
  ocean: "#0d2238",
  land: "#1f3b4d",
  border: "#3f6378",
  graticule: "rgba(140,180,210,0.12)",
  highlight: "#f5b041",
  accent: "#ff5a4f",
  text: "#ffffff",
  textStroke: "#06101f",
  font: fontFamily,
};
