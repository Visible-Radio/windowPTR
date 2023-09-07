declare type AttributeMap = {
    highlight?: boolean;
    color?: `rgb(${number},${number},${number})` | null;
    outline?: boolean | `rgb(${number},${number},${number})`;
};

export declare function createPTR(containerElement: HTMLDivElement, options?: Partial<DisplayConfigOptions>): {
    actions: {
        setScale: (userScale: number) => void;
        setRows: (userDisplayRows: number) => void;
        setGridSpace: (userGridSpace: number) => void;
        setGridSpaceX: (userGridSpace: number) => void;
        setGridSpaceY: (userGridSpace: number) => void;
        setScroll: (scrollValue: number) => void;
        scrollDown: (increment?: number) => void;
        scrollUp: (decrement?: number) => void;
        pageDown: () => void;
        pageUp: () => void;
        home: () => void;
        end: () => void;
        appendText: (documentText: string) => void;
        setText: (text: string) => void;
        animatedScrollDown: (increment?: number) => void;
        animatedScrollUp: (decrement?: number) => void;
    };
    store: {
        getState: () => Readonly<{
            documentSource: string;
            charDefs: any;
            displayOptions: {
                scale: number;
                displayRows: number;
                gridSpaceX_du: number;
                gridSpaceY_du: number;
                borderColor: rgb8Bit;
                borderWidth_du: number;
                borderGutter_du: number;
            };
            containerElement: HTMLDivElement;
            dm: Readonly<{
                borderColor: rgb8Bit;
                gridSpaceX_du: number;
                gridSpaceY_du: number;
                borderWidth_du: number;
                borderGutter_du: number;
                totalBorderWidth_du: number;
                remainingWidthXPx: number;
                displayColumns: number;
                displayRows: number;
                displayUnitsPerRow_du: number;
                displayWidth_du: number;
                displayWidth_px: number;
                displayHeight_du: number;
                displayHeight_px: number;
                drawAreaLeft_du: number;
                drawAreaTop_du: number;
                drawAreaRight_du: number;
                drawAreaBottom_du: number;
                drawAreaWidth_du: number;
                drawAreaHeight_du: number;
                cellWidth_du: number;
                cellHeight_du: number;
                scale: number;
                getColumnXCoord_du: (columnNo: number) => number;
                getColumnFromXCoord_du: (xCoord: number) => number;
                getRemainingRowSpace_du: (xCoord: number) => number;
                measureText: (text: string) => number;
                textFits: (text: string, xCoord: number) => boolean;
            }>;
            root: HTMLDivElement;
            ctx: CanvasRenderingContext2D;
            getTools: (scale: number) => {
                ctx: CanvasRenderingContext2D;
                moveTo_du(x: number, y: number): void;
                lineTo_du(x: number, y: number): void;
                drawRect_du(x: number, y: number, w: number, h: number): void;
                fillRect_du(x: number, y: number, w: number, h: number): void;
                strokeRect_du(x: number, y: number, w: number, h: number): void;
                clearRect_du(x: number, y: number, w: number, h: number): void;
            };
            scrollY_du: number;
            layoutList: SimpleLayoutObject[];
            isScrolling: boolean;
        }>;
        setState: (val: Partial<{
            documentSource: string;
            charDefs: any;
            displayOptions: {
                scale: number;
                displayRows: number;
                gridSpaceX_du: number;
                gridSpaceY_du: number;
                borderColor: rgb8Bit;
                borderWidth_du: number;
                borderGutter_du: number;
            };
            containerElement: HTMLDivElement;
            dm: Readonly<{
                borderColor: rgb8Bit;
                gridSpaceX_du: number;
                gridSpaceY_du: number;
                borderWidth_du: number;
                borderGutter_du: number;
                totalBorderWidth_du: number;
                remainingWidthXPx: number;
                displayColumns: number;
                displayRows: number;
                displayUnitsPerRow_du: number;
                displayWidth_du: number;
                displayWidth_px: number;
                displayHeight_du: number;
                displayHeight_px: number;
                drawAreaLeft_du: number;
                drawAreaTop_du: number;
                drawAreaRight_du: number;
                drawAreaBottom_du: number;
                drawAreaWidth_du: number;
                drawAreaHeight_du: number;
                cellWidth_du: number;
                cellHeight_du: number;
                scale: number;
                getColumnXCoord_du: (columnNo: number) => number;
                getColumnFromXCoord_du: (xCoord: number) => number;
                getRemainingRowSpace_du: (xCoord: number) => number;
                measureText: (text: string) => number;
                textFits: (text: string, xCoord: number) => boolean;
            }>;
            root: HTMLDivElement;
            ctx: CanvasRenderingContext2D;
            getTools: (scale: number) => {
                ctx: CanvasRenderingContext2D;
                moveTo_du(x: number, y: number): void;
                lineTo_du(x: number, y: number): void;
                drawRect_du(x: number, y: number, w: number, h: number): void;
                fillRect_du(x: number, y: number, w: number, h: number): void;
                strokeRect_du(x: number, y: number, w: number, h: number): void;
                clearRect_du(x: number, y: number, w: number, h: number): void;
            };
            scrollY_du: number;
            layoutList: SimpleLayoutObject[];
            isScrolling: boolean;
        }> | ((state: {
            documentSource: string;
            charDefs: any;
            displayOptions: {
                scale: number;
                displayRows: number;
                gridSpaceX_du: number;
                gridSpaceY_du: number;
                borderColor: rgb8Bit;
                borderWidth_du: number;
                borderGutter_du: number;
            };
            containerElement: HTMLDivElement;
            dm: Readonly<{
                borderColor: rgb8Bit;
                gridSpaceX_du: number;
                gridSpaceY_du: number;
                borderWidth_du: number;
                borderGutter_du: number;
                totalBorderWidth_du: number;
                remainingWidthXPx: number;
                displayColumns: number;
                displayRows: number;
                displayUnitsPerRow_du: number;
                displayWidth_du: number;
                displayWidth_px: number;
                displayHeight_du: number;
                displayHeight_px: number;
                drawAreaLeft_du: number;
                drawAreaTop_du: number;
                drawAreaRight_du: number;
                drawAreaBottom_du: number;
                drawAreaWidth_du: number;
                drawAreaHeight_du: number;
                cellWidth_du: number;
                cellHeight_du: number;
                scale: number;
                getColumnXCoord_du: (columnNo: number) => number;
                getColumnFromXCoord_du: (xCoord: number) => number;
                getRemainingRowSpace_du: (xCoord: number) => number;
                measureText: (text: string) => number;
                textFits: (text: string, xCoord: number) => boolean;
            }>;
            root: HTMLDivElement;
            ctx: CanvasRenderingContext2D;
            getTools: (scale: number) => {
                ctx: CanvasRenderingContext2D;
                moveTo_du(x: number, y: number): void;
                lineTo_du(x: number, y: number): void;
                drawRect_du(x: number, y: number, w: number, h: number): void;
                fillRect_du(x: number, y: number, w: number, h: number): void;
                strokeRect_du(x: number, y: number, w: number, h: number): void;
                clearRect_du(x: number, y: number, w: number, h: number): void;
            };
            scrollY_du: number;
            layoutList: SimpleLayoutObject[];
            isScrolling: boolean;
        }) => {
            documentSource: string;
            charDefs: any;
            displayOptions: {
                scale: number;
                displayRows: number;
                gridSpaceX_du: number;
                gridSpaceY_du: number;
                borderColor: rgb8Bit;
                borderWidth_du: number;
                borderGutter_du: number;
            };
            containerElement: HTMLDivElement;
            dm: Readonly<{
                borderColor: rgb8Bit;
                gridSpaceX_du: number;
                gridSpaceY_du: number;
                borderWidth_du: number;
                borderGutter_du: number;
                totalBorderWidth_du: number;
                remainingWidthXPx: number;
                displayColumns: number;
                displayRows: number;
                displayUnitsPerRow_du: number;
                displayWidth_du: number;
                displayWidth_px: number;
                displayHeight_du: number;
                displayHeight_px: number;
                drawAreaLeft_du: number;
                drawAreaTop_du: number;
                drawAreaRight_du: number;
                drawAreaBottom_du: number;
                drawAreaWidth_du: number;
                drawAreaHeight_du: number;
                cellWidth_du: number;
                cellHeight_du: number;
                scale: number;
                getColumnXCoord_du: (columnNo: number) => number;
                getColumnFromXCoord_du: (xCoord: number) => number;
                getRemainingRowSpace_du: (xCoord: number) => number;
                measureText: (text: string) => number;
                textFits: (text: string, xCoord: number) => boolean;
            }>;
            root: HTMLDivElement;
            ctx: CanvasRenderingContext2D;
            getTools: (scale: number) => {
                ctx: CanvasRenderingContext2D;
                moveTo_du(x: number, y: number): void;
                lineTo_du(x: number, y: number): void;
                drawRect_du(x: number, y: number, w: number, h: number): void;
                fillRect_du(x: number, y: number, w: number, h: number): void;
                strokeRect_du(x: number, y: number, w: number, h: number): void;
                clearRect_du(x: number, y: number, w: number, h: number): void;
            };
            scrollY_du: number;
            layoutList: SimpleLayoutObject[];
            isScrolling: boolean;
        })) => void;
        subscribe: <SelectorResult extends string | number | boolean | unknown[] | Record<string, unknown>>(selector: (state: {
            documentSource: string;
            charDefs: any;
            displayOptions: {
                scale: number;
                displayRows: number;
                gridSpaceX_du: number;
                gridSpaceY_du: number;
                borderColor: rgb8Bit;
                borderWidth_du: number;
                borderGutter_du: number;
            };
            containerElement: HTMLDivElement;
            dm: Readonly<{
                borderColor: rgb8Bit;
                gridSpaceX_du: number;
                gridSpaceY_du: number;
                borderWidth_du: number;
                borderGutter_du: number;
                totalBorderWidth_du: number;
                remainingWidthXPx: number;
                displayColumns: number;
                displayRows: number;
                displayUnitsPerRow_du: number;
                displayWidth_du: number;
                displayWidth_px: number;
                displayHeight_du: number;
                displayHeight_px: number;
                drawAreaLeft_du: number;
                drawAreaTop_du: number;
                drawAreaRight_du: number;
                drawAreaBottom_du: number;
                drawAreaWidth_du: number;
                drawAreaHeight_du: number;
                cellWidth_du: number;
                cellHeight_du: number;
                scale: number;
                getColumnXCoord_du: (columnNo: number) => number;
                getColumnFromXCoord_du: (xCoord: number) => number;
                getRemainingRowSpace_du: (xCoord: number) => number;
                measureText: (text: string) => number;
                textFits: (text: string, xCoord: number) => boolean;
            }>;
            root: HTMLDivElement;
            ctx: CanvasRenderingContext2D;
            getTools: (scale: number) => {
                ctx: CanvasRenderingContext2D;
                moveTo_du(x: number, y: number): void;
                lineTo_du(x: number, y: number): void;
                drawRect_du(x: number, y: number, w: number, h: number): void;
                fillRect_du(x: number, y: number, w: number, h: number): void;
                strokeRect_du(x: number, y: number, w: number, h: number): void;
                clearRect_du(x: number, y: number, w: number, h: number): void;
            };
            scrollY_du: number;
            layoutList: SimpleLayoutObject[];
            isScrolling: boolean;
        }) => SelectorResult, cb: (selectorResult: SelectorResult) => void) => () => void;
    };
};

declare type DisplayConfigOptions = typeof displayConfigOptionsDefault;

declare const displayConfigOptionsDefault: {
    scale: number;
    displayRows: number;
    gridSpaceX_du: number;
    gridSpaceY_du: number;
    borderColor: rgb8Bit;
    borderWidth_du: number;
    borderGutter_du: number;
};

declare class Element_2 {
    protected __tagName: string;
    protected __attributes: Partial<AttributeMap>;
    protected __parent: Element_2;
    protected __children: Node_2[];
    constructor(tagName: string, parent: Element_2, attributes: Partial<AttributeMap>);
    get tag(): string;
    get attributes(): Partial<AttributeMap>;
    get parent(): Element_2;
    get children(): Node_2[];
    toString(): string;
    get nextSibling(): Node_2 | undefined;
}

declare type Enumerate<N extends number, Acc extends number[] = []> = Acc["length"] extends N ? Acc[number] : Enumerate<N, [...Acc, Acc["length"]]>;

declare type int8Bit = IntRange<0, 255>;

declare type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;

declare type Node_2 = Element_2 | Text_2;

declare type rgb8Bit = [int8Bit, int8Bit, int8Bit];

declare interface SimpleLayoutObject {
    x: number;
    y: number;
    char: string;
    attributes?: AttributeMap;
    node?: Text_2;
}

declare class Text_2 {
    protected __text: string;
    protected __parent: Element_2;
    protected __children: never[];
    constructor(text: string, parent: Element_2);
    get text(): string;
    get parent(): Element_2;
    get children(): never[];
    toString(): string;
    get nextSibling(): Node_2 | undefined;
    get ancestorAttributes(): AttributeMap;
}

export { }
