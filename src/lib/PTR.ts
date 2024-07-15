import { modifyDefs } from '../utils/modifyDefs';
import { rgbToString } from '../utils/rgbToString';
import { rgb8Bit } from '../utils/typeUtils/intRange';
import { DisplayMetrics } from './DisplayMetrics';
import { Layout } from './Layout';
import { DisplayConfigOptions } from './calculateDisplayMetrics';
import configureCanvas from './configureCanvas';
import customDefs_charWidth_7 from './customDefs_charWidth_7';
import { drawScreen } from './draw/drawScreen';
import makeDrawingTools from './makeDrawingTools';
import { Element, parse, printTree } from './parse/parser';

export class PTR {
  public rootElement: HTMLDivElement;
  private canvasElement: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public defs: typeof customDefs_charWidth_7;
  public dm: DisplayMetrics;
  public drawingTools: ReturnType<typeof makeDrawingTools>;
  private displayOptions: DisplayConfigOptions & { documentSource: string };
  private documentSource: string;
  public documentTree: Element;
  public layout: Layout;
  public scrollY = 0;
  constructor(
    containerElement: HTMLDivElement,
    options: Partial<DisplayConfigOptions & { documentSource: string }>
  ) {
    this.defs = modifyDefs(customDefs_charWidth_7);
    this.rootElement = this.makeRoot(containerElement);
    this.canvasElement = this.makeCanvas(this.rootElement);
    const context = this.canvasElement.getContext('2d');
    if (!context) throw new Error('no canvas 2d context 🤷🏻');
    this.ctx = context;
    this.displayOptions = {
      scale: 2,
      displayRows: 8,
      gridSpaceX_du: -3,
      gridSpaceY_du: 5,
      borderColor: [200, 0, 120] as rgb8Bit,
      borderWidth_du: 1,
      borderGutter_du: 5,
      documentSource: '',
      ...options,
    };
    this.dm = new DisplayMetrics({
      charWidth: this.defs.charWidth,
      root: this.rootElement,
      options: this.displayOptions,
    });
    this.drawingTools = makeDrawingTools(this.ctx, this.dm.values.scale);
    configureCanvas(this.ctx, this.dm.values);
    this.documentSource = this.displayOptions.documentSource;
    this.documentTree = parse(this.documentSource);

    this.layout = new Layout(this);

    console.log(printTree(this.documentTree));

    window.addEventListener('resize', () => this.onWindowResize(this));
  }
  onWindowResize(ptr: PTR) {
    this.dm.calculateMetrics();
    configureCanvas(ptr.ctx, this.dm.values);
    this.layout = new Layout(this);
  }

  update(deltaTime: number) {
    /*  */
  }
  draw(deltaTime: number) {
    this.clearDrawArea();
    this.drawBorder();
    drawScreen(this);
    // this.drawCellOutlines();
  }
  clearDrawArea() {
    const {
      drawAreaLeft_du,
      drawAreaTop_du,
      drawAreaRight_du,
      drawAreaHeight_du,
    } = this.dm.values;
    this.drawingTools.clearRect_du(
      drawAreaLeft_du,
      drawAreaTop_du - 2,
      drawAreaRight_du,
      drawAreaHeight_du + 3
    );
  }
  makeRoot(container: HTMLDivElement, idExtension?: string) {
    const root = document.createElement('div');
    root.setAttribute('id', `__PTRwindow_root_element-${idExtension}`);
    root.classList.add('PTRwindow_root_element');
    root.style.boxSizing = 'border-box';
    container.appendChild(root);
    return root;
  }
  makeCanvas(container: HTMLDivElement) {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', '__PTRwindow_canvas_element');
    canvas.style.background = 'black';
    container.appendChild(canvas);
    return canvas;
  }
  drawCellOutlines() {
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = rgbToString([0, 100, 220]);
    const {
      drawAreaLeft_du,
      drawAreaTop_du,
      cellWidth_du,
      cellHeight_du,
      gridSpaceY_du,
      gridSpaceX_du,
      displayColumns,
      displayRows,
    } = this.dm.values;
    for (let row = 0; row < displayRows; row++) {
      for (let col = 0; col < displayColumns; col++) {
        this.drawingTools.strokeRect_du(
          drawAreaLeft_du + cellWidth_du * col + gridSpaceX_du * col,
          drawAreaTop_du + cellHeight_du * row + gridSpaceY_du * row,
          cellWidth_du,
          cellHeight_du
        );
      }
    }
  }
  drawBorder() {
    const {
      borderColor,
      borderWidth_du,
      scale,
      displayHeight_du,
      displayWidth_du,
    } = this.dm.values;
    this.ctx.strokeStyle = rgbToString(borderColor);
    this.ctx.lineWidth = borderWidth_du * scale;
    this.drawingTools.strokeRect_du(
      borderWidth_du / 2,
      borderWidth_du / 2,
      displayWidth_du - borderWidth_du,
      displayHeight_du - borderWidth_du
    );
  }
}

export function runPTR(ptr: PTR) {
  let lastTime = 0;
  animate(0);
  function animate(timeStamp: number) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ptr.update(deltaTime);
    ptr.draw(deltaTime);
    requestAnimationFrame(animate);
  }
}
