import { AbsoluteFill, useVideoConfig } from "remotion";
import { MapFrame } from "../../../components/Map";
import { Raster } from "../../../components/Raster";
import { view } from "../news/kit";
import { VW } from "./places";
import * as S from "./scenes";

// Dev sheet: every Naresuan scene for 90 frames, one after another (stills at +60 for a contact sheet).
const LIST: [string, (start: number, end: number) => import("react").ReactNode][] = [
  ["pegu", (a, b) => <S.PeguScene id="t1" start={a} end={b} />],
  ["peguBurn", (a, b) => <S.PeguScene id="t2" start={a} end={b} burn={1} />],
  ["throne", (a, b) => <S.BurmeseThroneScene id="t3" start={a} end={b} />],
  ["whiteEl", (a, b) => <S.WhiteElephantScene id="t4" start={a} end={b} />],
  ["march", (a, b) => <S.MarchScene id="t5" start={a} end={b} />],
  ["battle", (a, b) => <S.BattleScene id="t6" start={a} end={b} hits={[a + 30, a + 60]} />],
  ["siege", (a, b) => <S.CitySiegeScene id="t7" start={a} end={b} burn={1} />],
  ["burning", (a, b) => <S.BurningCityScene id="t8" start={a} end={b} />],
  ["ambush", (a, b) => <S.AmbushScene id="t9" start={a} end={b} hits={[a + 30]} />],
  ["raid", (a, b) => <S.RiverRaidScene id="t10" start={a} end={b} />],
  ["lead", (a, b) => <S.LeadChargeScene id="t11" start={a} end={b} />],
  ["hostage", (a, b) => <S.HostageScene id="t12" start={a} end={b} />],
  ["princess", (a, b) => <S.PrincessScene id="t13" start={a} end={b} />],
  ["training", (a, b) => <S.TrainingScene id="t14" start={a} end={b} />],
  ["submit", (a, b) => <S.SubmitScene id="t15" start={a} end={b} />],
  ["arrive", (a, b) => <S.ArriveScene id="t16" start={a} end={b} />],
  ["pyre", (a, b) => <S.PyreScene id="t17" start={a} end={b} />],
  ["revolt", (a, b) => <S.RevoltScene id="t18" start={a} end={b} />],
  ["summon", (a, b) => <S.SummonScene id="t19" start={a} end={b} hits={[a + 40]} />],
  ["camp", (a, b) => <S.CampNightScene id="t20" start={a} end={b} />],
  ["plot", (a, b) => <S.PlotScene id="t21" start={a} end={b} />],
  ["monk", (a, b) => <S.MonkCouncilScene id="t22" start={a} end={b} />],
  ["declare", (a, b) => <S.DeclareScene id="t23" start={a} end={b} />],
  ["declareClose", (a, b) => <S.DeclareScene id="t24" start={a} end={b} close />],
  ["scribe", (a, b) => <S.ScribeScene id="t25" start={a} end={b} />],
  ["families", (a, b) => <S.FamiliesScene id="t26" start={a} end={b} />],
  ["riverShot", (a, b) => <S.RiverShotScene id="t27" start={a} end={b} shot={a + 30} />],
  ["gun", (a, b) => <S.GunRelicScene id="t28" start={a} end={b} />],
  ["oath", (a, b) => <S.OathScene id="t29" start={a} end={b} />],
  ["gate", (a, b) => <S.GateScene id="t30" start={a} end={b} />],
  ["loot", (a, b) => <S.LootScene id="t31" start={a} end={b} />],
  ["siegeCamp", (a, b) => <S.SiegeCampScene id="t32" start={a} end={b} />],
  ["island", (a, b) => <S.IslandScene id="t33" start={a} end={b} />],
  ["flood", (a, b) => <S.IslandScene id="t34" start={a} end={b} flood={1} />],
  ["climb", (a, b) => <S.SwordClimbScene id="t35" start={a} end={b} />],
  ["retreat", (a, b) => <S.RetreatScene id="t36" start={a} end={b} />],
  ["compare", (a, b) => <S.CompareScene id="t37" start={a} end={b} tilt={1} />],
  ["throneLight", (a, b) => <S.ThroneLightScene id="t38" start={a} end={b} />],
  ["silhouette", (a, b) => <S.DuelSilhouetteScene id="t39" start={a} end={b} />],
  ["duel", (a, b) => <S.DuelScene id="t40" start={a} end={b} hits={[a + 50]} />],
  ["ngao", (a, b) => <S.NgaoCloseScene id="t41" start={a} end={b} hatCut={a + 50} />],
  ["musket", (a, b) => <S.MusketScene id="t42" start={a} end={b} shots={[a + 50]} />],
  ["judge", (a, b) => <S.JudgementScene id="t43" start={a} end={b} monks />],
  ["port", (a, b) => <S.PortScene id="t44" start={a} end={b} />],
  ["dutch", (a, b) => <S.DutchScene id="t45" start={a} end={b} />],
  ["ruin", (a, b) => <S.RuinScene id="t46" start={a} end={b} />],
  ["lost", (a, b) => <S.LostRecordsScene id="t47" start={a} end={b} />],
  ["sick", (a, b) => <S.SickTentScene id="t48" start={a} end={b} arrive />],
  ["hills", (a, b) => <S.HillsScene id="t49" start={a} end={b} army />],
  ["lawaek", (a, b) => <S.LawaekScene id="t50" start={a} end={b} />],
  ["coronation", (a, b) => <S.CoronationScene id="t51" start={a} end={b} />],
  ["skirt", (a, b) => <S.SkirtScene id="t52" start={a} end={b} throw={a + 30} />],
  ["pass", (a, b) => <S.PassScene id="t53" start={a} end={b} />],
  ["riverCamp", (a, b) => <S.RiverCampScene id="t54" start={a} end={b} />],
];
export const SCENE_TEST_FRAMES = LIST.length * 90;
export const SCENE_TEST_NAMES = LIST.map(([n]) => n);

export const NrsSceneTest = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#02060d" }}>
      <MapFrame cam={view(VW.region, width, height, 1, 0.08)}>
        <Raster layers={[{ name: "world" }, { name: "sea" }]} />
        {LIST.map(([n, r], i) => <g key={n}>{r(i * 90, i * 90 + 89)}</g>)}
      </MapFrame>
    </AbsoluteFill>
  );
};
