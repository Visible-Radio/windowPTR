import { modifyDefs } from '../utils/modifyDefs';
import { rgbToString } from '../utils/rgbToString';
import { rgb8Bit } from '../utils/typeUtils/intRange';
import { DisplayMetrics } from './DisplayMetrics';
import { Layout } from './Layout';
import { Letters } from './Letters/Letters';
import { ScrollHandler } from './ScrollHandler';
import { DisplayConfigOptions } from './calculateDisplayMetrics';
import customDefs_charWidth_7 from './customDefs_charWidth_7';
import makeDrawingTools from './makeDrawingTools';
import { Element, parse, printTree } from './parse/parser';

/* we may have 2 kinds of animations.
  - per letter animations that run on initial draw or persistently after initial draw
  - TextNode animations, that run when we've finished the initial draw for all of the text node's letters */

/* PTR's update method will need to regulate the introduction of each letter
  - ie, finish drawing each letter before adding the next
  - in doing this, it can track when the current node isn't the same as the last node
    - at that point, if the TextNode has animations attached to it, they can be run */

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
  letters: Letters;
  scrollHandler: ScrollHandler;
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
      drawCellOutlines: false,
      ...options,
    };
    this.dm = new DisplayMetrics({
      charWidth: this.defs.charWidth,
      root: this.rootElement,
      options: this.displayOptions,
    });
    this.drawingTools = makeDrawingTools(this.ctx, this.dm.values.scale);
    this.configureCanvas();
    this.documentSource = this.displayOptions.documentSource;
    this.documentTree = parse(this.documentSource);

    this.layout = new Layout(this);
    this.letters = new Letters(this);
    this.scrollHandler = new ScrollHandler(this);

    console.log(printTree(this.documentTree));

    window.addEventListener('resize', () => this.onWindowResize());
  }

  configureCanvas() {
    this.ctx.canvas.width = this.dm.values.displayWidth_px;
    this.ctx.canvas.height = this.dm.values.displayHeight_px;
  }

  onWindowResize() {
    this.dm.calculateMetrics();
    this.configureCanvas();
    this.layout = new Layout(this);
    this.letters.updateLayout();
  }

  appendToDocument(incomingDocument: string) {
    if (this.layout.layoutList.length === 0) {
      return this.setDocument(incomingDocument);
    }
    const incomingDocumentTree = parse(incomingDocument);
    incomingDocumentTree.children.forEach((node) =>
      this.documentTree.children.push(node)
    );
    // not really efficient - we redo the layout, even for things we have already done
    this.layout = new Layout(this);
    this.letters.addLetters();
    console.log(printTree(this.documentTree));
  }

  setDocument(document: string) {
    this.documentSource = document;
    this.documentTree = parse(this.documentSource);
    this.layout = new Layout(this);
    this.letters = new Letters(this);
    this.scrollY = 0;
    console.log(printTree(this.documentTree));
  }

  update(deltaTime: number) {
    /* we can pass delta time to update - but we may not use it there */
    this.letters.update(deltaTime);
    this.scrollHandler.update(deltaTime);
  }

  draw(deltaTime: number) {
    this.clearDrawArea();

    const letterPixels = this.letters.list
      /* we'll now pass deltaTime directly to the letter's getFrame method */
      .map((letter) => letter.getFrame(deltaTime))
      .flat();

    letterPixels.forEach((pixel) => {
      this.ctx.fillStyle = rgbToString(pixel.color);
      this.drawingTools.fillRect_du(pixel.x, pixel.y - this.scrollY, 1, 1);
    });
    this.drawBorder();
    this.drawCellOutlines();
  }

  clearDrawArea() {
    const { displayHeight_du, displayWidth_du } = this.dm.values;
    // these coordinates will clear everything including the border
    const args = [0, 0, displayWidth_du, displayHeight_du] as const;
    this.drawingTools.clearRect_du(...args);
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
    if (!this.displayOptions.drawCellOutlines) return;
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

  run() {
    let lastTime = 0;
    const animate = (timeStamp: number) => {
      const deltaTime = timeStamp - lastTime;
      lastTime = timeStamp;
      this.update(deltaTime);
      this.draw(deltaTime);
      requestAnimationFrame(animate);
    };
    animate(0);
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
