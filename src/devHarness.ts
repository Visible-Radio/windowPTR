import { PTR } from './main';
import { rgbToString } from './utils/rgbToString';
import { rgb8Bit } from './utils/typeUtils/intRange';
const colorArr = [10, 100, 254] as rgb8Bit;
const color = rgbToString(colorArr);

const borgText = `
<span color=${color} >  
  <span highlight=true>
    <span>Resistance</span><span highlight=false outline=true>is</span><span blink=true>futile</span>
  </span>
  <p>We are the <span><span blink=true>B</span><span blink=true>O</span><span blink=true>R</span><span blink=true>G</span></span>. Lower your shields and surrender your ships. We will add your biological and technological distinctiveness <span color=rgb(190,120,0)>to our own. Your culture will adapt to</span> service us.</p>
</span>
`;

const withColor = (text: string) =>
  `<span>
    <span color=${color}>
      ${text}
    </span>
  </span>`;

const ptr = new PTR(document.getElementById('root') as HTMLDivElement, {
  scale: 3,
  documentSource: withColor(
    'hello this is my text that I put in here for you all to read.'
  ),
  characterResolution: 'all',
  displayRows: 12,
  // displayColumns: 24,
  borderColor: [0, 0, 0],
  idExtension: '1',
  drawBoundingBoxes: true,
}).run();

declare global {
  interface Window {
    _ptr: PTR;
  }
}

window._ptr = ptr;

type UIControl = {
  id: string;
  label: string;
} & (UIButton | UIInputNumber);

type UIButton = {
  onClick: () => void;
  type: 'button';
};

type UIInputNumber = {
  max: number;
  min: number;
  value: number;
  type: 'inputNumber';
  onchange: (event: any) => void;
};

const controls: UIControl[] = [
  {
    id: 'appendToDocument',
    label: 'Append to document',
    type: 'button',
    onClick: async () => {
      const text = prompt('Append to Document') ?? '';
      ptr.appendToDocument(withColor(text), 'all');
    },
  },
  {
    id: 'setDocument',
    label: 'Set Document',
    type: 'button',
    onClick: () => {
      const text = prompt('Set Document') ?? '_1';
      ptr.setDocument(withColor(text), 'all');
    },
  },
  {
    id: 'reset',
    label: 'Reset Example',
    type: 'button',
    onClick: () => {
      ptr.setDocument(borgText);
    },
  },
  {
    id: 'toggleCellOutlines',
    label: 'Toggle Cell Outlines',
    type: 'button',
    onClick: () => {
      ptr.set('drawCellOutlines', !ptr.dm.getOptions().drawCellOutlines);
    },
  },
  {
    id: 'rowsInput',
    type: 'inputNumber',
    min: 1,
    max: 50,
    value: 1,
    label: 'Rows',
    onchange: (event) => {
      ptr.set('displayRows', parseInt(event.target.value, 10));
    },
  },
  {
    id: 'colsInput',
    type: 'inputNumber',
    min: 1,
    max: 50,
    value: ptr.dm.values.displayColumns,
    label: 'Columns',
    onchange: (event) => {
      ptr.set('displayColumns', parseInt(event.target.value, 10));
    },
  },
  {
    id: 'scaleInput',
    type: 'inputNumber',
    min: 1,
    max: 50,
    value: ptr.dm.getOptions().scale,
    label: 'Scale',
    onchange: (event) => {
      ptr.set('scale', parseInt(event.target.value, 10));
    },
  },
  {
    id: 'borderGutterInput',
    type: 'inputNumber',
    min: -2,
    max: 50,
    value: ptr.dm.getOptions().borderGutter_du,
    label: 'Border Gutter',
    onchange: (event) => {
      ptr.set('borderGutter_du', parseInt(event.target.value, 10));
    },
  },
  {
    id: 'gridSpaceX',
    type: 'inputNumber',
    min: -5,
    max: 50,
    value: ptr.dm.getOptions().gridSpaceX_du,
    label: 'Grid Space X',
    onchange: (event) => {
      ptr.set('gridSpaceX_du', parseInt(event.target.value, 10));
    },
  },
  {
    id: 'gridSpaceY',
    type: 'inputNumber',
    min: -5,
    max: 50,
    value: ptr.dm.getOptions().gridSpaceY_du,
    label: 'Grid Space Y',
    onchange: (event) => {
      ptr.set('gridSpaceY_du', parseInt(event.target.value, 10));
    },
  },
];

const renderInto = document.getElementById('devHarnessButtons');

controls.forEach((control) => {
  if (control.type === 'button') {
    const button = document.createElement('button');
    button.id = control.id;
    button.innerText = control.label;
    button.onclick = control.onClick;
    button.style.background = color;
    renderInto?.appendChild(button);
    return;
  }
  if (control.type === 'inputNumber') {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.id = control.id;
    input.type = 'number';
    input.max = control.max.toString();
    input.min = control.min.toString();
    input.value = control.value.toString();
    input.style.background = color;
    input.onchange = control.onchange;
    label.textContent = control.label;
    label.style.background = color;
    label.appendChild(input);
    renderInto?.appendChild(label);
  }
});
