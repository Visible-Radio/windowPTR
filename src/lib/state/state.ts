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
const initDm = calculateDisplayMetrics(charDefs.charWidth, initRoot);
const intDrawingTools = useDrawingTools(initCtx);
// const initText = neuromancerText;
const initText = `
<span>
  <span outline=true>
    Resistance is futile
  </span>
  <p highlight=true>
    Resistance is futile
  </p>
  <p>We are the Borg. Lower your shields and surrender your ships. We will add your biological and technological distinctiveness to our own. Your culture will adapt to service us.</p>
</span>
`;

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
