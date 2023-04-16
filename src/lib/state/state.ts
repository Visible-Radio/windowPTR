import { neuromancerText } from "../../sampleText/neuromancer";
import { createSubscribableStore } from "../../stateContainer/createSubscribableStore";
import { makeCanvas } from "../../utils/makeCanvas";
import { modifyDefs } from "../../utils/modifyDefs";
import { DisplayMetrics } from "../../utils/typeUtils/configuredCanvas";
import calculateDisplayMetrics from "../calculateDisplayMetrics";
import customDefs_charWidth_7 from "../customDefs_charWidth_7";
import { SimpleLayoutObject } from "../layout/layoutByCharacter";
import { useDrawingTools } from "../makeDrawingTools";

const charDefs = modifyDefs(customDefs_charWidth_7);
const initRoot = document.getElementById("root") as HTMLDivElement;
const initCtx = makeCanvas(initRoot).getContext("2d")!;
const initText = neuromancerText;
const initDm = calculateDisplayMetrics(charDefs.charWidth, initRoot);
const intDrawingTools = useDrawingTools(initCtx);
// const initText = `
// this text has nothing
// <span>
//   <span highlight=true color=rgb(0,0,250)>
//     This text is colored and highlighted.
//     <span color=null>the color of this text is reset to the default color</span>
//     <span highlight=false>even though the parent is highlighted, this span is not</span>
//   </span>
//     This text is just colored
// </span>
// this text has nothing
// `;

export interface MainStoreState {
  layoutList: SimpleLayoutObject[];
  dm: DisplayMetrics;
  charDefs: ReturnType<typeof modifyDefs>;
  root: HTMLDivElement;
  ctx: CanvasRenderingContext2D;
  getTools: ReturnType<typeof useDrawingTools>;
  simpleText: string;
  scrollY_du: number;
  isScrolling: boolean;
}

const mainStoreTemplateState = {
  dm: initDm,
  charDefs,
  root: initRoot,
  ctx: initCtx,
  getTools: intDrawingTools,
  simpleText: initText,
  scrollY_du: 0,
  layoutList: [] as SimpleLayoutObject[],
  isScrolling: false,
};

export const store = createSubscribableStore(mainStoreTemplateState);
