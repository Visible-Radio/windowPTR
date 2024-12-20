import { modifyDefs } from '../utils/modifyDefs';
import { rgbToString } from '../utils/rgbToString';
import { rgb8Bit } from '../utils/typeUtils/intRange';
import { DisplayMetrics } from './DisplayMetrics';
import { Layout } from './Layout';
import { Letters, Letter } from './Letters/Letters';
import { ScrollHandler } from './ScrollHandler';
import { MouseTracker } from './MouseTracker/MouseTracker';
import { DisplayConfigOptions } from './calculateDisplayMetrics';
import customDefs_charWidth_7 from './customDefs_charWidth_7';
import makeDrawingTools from './makeDrawingTools';
import { Element, Node, parse, printTree, Text } from './parse/parser';
import { NodeMetaMap } from './NodeMetaMap/NodeMetaMap';
import { traverseReduce } from '../utils/traverseReduce';
import { generateRandomColors } from './utils';

export class PTR {
  public rootElement: HTMLDivElement;
  canvasElement: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public defs: typeof customDefs_charWidth_7;
  public dm: DisplayMetrics;
  public drawingTools: ReturnType<typeof makeDrawingTools>;
  displayOptions: DisplayConfigOptions;
  private documentSource: string;
  public documentTree: Element;
  public layout: Layout;
  public scrollY = 0;
  letters: Letters;
  scrollHandler: ScrollHandler;
  mouseTracker: MouseTracker;
  nodeMetaMap: NodeMetaMap;
  characterResolution: 'all' | 'single';
  functions?: Record<string, (ptr: PTR, letters: Letter[]) => void>;

  constructor(
    containerElement: HTMLDivElement,
    options: Partial<
      DisplayConfigOptions & {
        documentSource: string;
        idExtension?: string;
        characterResolution?: 'all' | 'single';
        functions?: Record<string, (ptr: PTR, letters: Letter[]) => void>;
      }
    >
  ) {
    this.defs = modifyDefs(customDefs_charWidth_7);
    this.rootElement = this.makeRoot(containerElement, options.idExtension);
    this.canvasElement = this.makeCanvas(this.rootElement);
    const context = this.canvasElement.getContext('2d');
    if (!context) throw new Error('no canvas 2d context 🤷🏻');
    this.ctx = context;
    this.dm = new DisplayMetrics({
      charWidth: this.defs.charWidth,
      root: this.rootElement,
      options: {
        scale: 2,
        displayRows: 8,
        gridSpaceX_du: 0,
        gridSpaceY_du: 5,
        borderWidth_du: 0,
        borderGutter_du: 3,
        borderColor: [0, 0, 0] as rgb8Bit,
        drawCellOutlines: false,
        drawBoundingBoxes: false,
        ...options, // this contains other options unrelated to the DisplayMetrics class
      },
    });
    this.functions = options?.functions;
    this.characterResolution = options.characterResolution ?? 'single';
    this.displayOptions = this.dm.getOptions();
    this.drawingTools = makeDrawingTools(this.ctx, this.dm.values.scale);
    this.configureCanvas();
    this.documentSource = options.documentSource ?? '';
    this.documentTree = parse(this.documentSource);
    this.nodeMetaMap = new NodeMetaMap();
    this.layout = new Layout(this);
    this.letters = new Letters(this);
    this.scrollHandler = new ScrollHandler(this);
    this.mouseTracker = new MouseTracker(this);
    window.addEventListener('resize', () => this.onWindowResize());
  }

  printTree() {
    console.log(printTree(this.documentTree));
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

  async appendToDocument(
    incomingDocument: string,
    characterResolution?: 'all' | 'single'
  ) {
    const incomingDocumentTree = parse(incomingDocument);
    incomingDocumentTree.children.forEach((node) =>
      this.documentTree.children.push(node)
    );
    // not really efficient - we redo the layout, even for things we have already done
    this.layout = new Layout(this);
    return this.letters.addLetters(characterResolution);
  }

  setDocument(document: string, characterResolution?: 'all' | 'single') {
    if (characterResolution) {
      this.characterResolution = characterResolution;
    }
    this.documentSource = document;
    this.documentTree = parse(this.documentSource);
    this.nodeMetaMap = new NodeMetaMap();
    this.layout = new Layout(this);
    this.letters = new Letters(this);
    this.scrollY = 0;
  }

  set<T extends keyof DisplayConfigOptions>(
    optionKey: T,
    value: NonNullable<DisplayConfigOptions[T]>
  ) {
    this.dm.setOptions((currentOptions) => ({
      ...currentOptions,
      [optionKey]: value,
    }));
    this.displayOptions = this.dm.getOptions();
    this.drawingTools = makeDrawingTools(this.ctx, this.dm.values.scale);
    this.configureCanvas();
    this.layout = new Layout(this);
    this.letters.updateLayout();
  }

  update() {
    this.scrollHandler.update();
    this.letters.update();
  }

  draw(deltaTime: number) {
    this.clearDrawArea();

    const letterPixels = this.letters.list
      .map((letter) => letter.getFrame(deltaTime))
      .flat();

    for (const pixel of letterPixels) {
      if (pixel.y - this.scrollY > this.dm.values.displayHeight_du) {
        continue;
      }
      if (pixel.y - this.scrollY <= 0) {
        continue;
      }
      this.ctx.fillStyle = rgbToString(pixel.color);
      this.drawingTools.fillRect_du(pixel.x, pixel.y - this.scrollY, 1, 1);
    }

    this.drawBorder();
    this.drawCellOutlines();
    // this.drawNodeBoundingBoxes();
    this.drawCrossHair();
  }

  drawCrossHair() {
    if (!this.mouseTracker.onScreen) return;
    let lineThickness = 1;
    let lineLength = 2;
    if (this.mouseTracker.cursorType === 'pointer') {
      lineLength *= 1.5;
      lineThickness *= 1.5;
    }

    type line = [number, number, number, number];

    const lines: line[] = [
      [
        this.mouseTracker.x_du,
        this.mouseTracker.y_du + lineThickness,
        lineThickness,
        lineLength,
      ],
      [
        this.mouseTracker.x_du + lineThickness,
        this.mouseTracker.y_du,
        lineLength,
        lineThickness,
      ],
      [
        this.mouseTracker.x_du,
        this.mouseTracker.y_du,
        lineThickness,
        lineLength + 1,
      ],
      [
        this.mouseTracker.x_du - lineLength,
        this.mouseTracker.y_du,
        lineLength,
        lineThickness,
      ],
      [
        this.mouseTracker.x_du,
        this.mouseTracker.y_du - lineLength,
        lineThickness,
        lineLength,
      ],
    ];

    if (this.mouseTracker.cursorType === 'pointer') {
      this.ctx.fillStyle = rgbToString([0, 0, 0]);
      lines
        .map(
          ([x, y, ...rest]) =>
            [x + lineThickness, y + lineThickness, ...rest] as line
        )
        .forEach((line) => this.drawingTools.fillRect_du(...line));
      this.ctx.fillStyle = generateRandomColors(0.9);
    }

    lines.forEach((line) => this.drawingTools.fillRect_du(...line));
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

  visitNodes(callback: (node: Node) => void) {
    traverseReduce(
      this.documentTree,
      (_, node) => {
        callback(node);
        return undefined;
      },
      undefined
    );
  }

  drawNodeBoundingBoxes() {
    if (!this.displayOptions.drawBoundingBoxes) return;
    this.visitNodes((node) => {
      if (node instanceof Text) {
        const nodeMeta = this.nodeMetaMap.map.get(node);
        if (!nodeMeta) return;
        nodeMeta.boundingBoxes.forEach((box) => {
          this.ctx.lineWidth = 1;
          this.ctx.strokeStyle = rgbToString([0, 100, 220]);
          this.drawingTools.strokeRect_du(
            box.topLeft.x,
            box.topLeft.y - this.scrollY,
            box.width,
            box.height
          );
        });
      }
    });
  }

  run() {
    let lastTime = 0;
    const animate = (timeStamp: number) => {
      const deltaTime = timeStamp - lastTime;
      lastTime = timeStamp;
      this.update();
      this.draw(deltaTime);
      requestAnimationFrame(animate);
    };
    animate(0);
    return this;
  }
}
