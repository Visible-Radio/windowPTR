import { createSubscribableStore } from '../../stateContainer/createSubscribableStore';
import { makeCanvas } from '../../utils/makeCanvas';
import { makeRoot } from '../../utils/makeRoot';
import { modifyDefs } from '../../utils/modifyDefs';
import { TDisplayMetrics } from '../../utils/typeUtils/configuredCanvas';
import calculateDisplayMetrics, {
  DisplayConfigOptions,
} from '../calculateDisplayMetrics';
import customDefs_charWidth_7 from '../customDefs_charWidth_7';
import { SimpleLayoutObject } from '../layout/layoutByCharacter';
import { useDrawingTools } from '../makeDrawingTools';

export interface MainStoreState {
  layoutList: SimpleLayoutObject[];
  dm: TDisplayMetrics;
  charDefs: ReturnType<typeof modifyDefs>;
  root: HTMLDivElement;
  ctx: CanvasRenderingContext2D;
  getTools: ReturnType<typeof useDrawingTools>;
  documentSource: string;
  scrollY_du: number;
  isScrolling: boolean;
}

/* passing these options isn't really implemented yet 🙃 */
export const createPtrGlobalStore = (
  options: Partial<Pick<MainStoreState, 'documentSource' | 'charDefs'>> & {
    displayOptions: DisplayConfigOptions;
    containerElement: HTMLDivElement;
  }
) => {
  const charDefs = modifyDefs(customDefs_charWidth_7);
  const initRoot = makeRoot(options.containerElement);
  const initCtx = makeCanvas(initRoot).getContext('2d')!;
  const initDm = calculateDisplayMetrics(
    charDefs.charWidth,
    initRoot,
    options.displayOptions
  );
  const intDrawingTools = useDrawingTools(initCtx);

  const mainStoreTemplateState = {
    dm: initDm,
    charDefs,
    root: initRoot,
    ctx: initCtx,
    getTools: intDrawingTools,
    documentSource: '',
    scrollY_du: 0,
    layoutList: [] as SimpleLayoutObject[],
    isScrolling: false,
  };

  return createSubscribableStore({ ...mainStoreTemplateState, ...options });
};
