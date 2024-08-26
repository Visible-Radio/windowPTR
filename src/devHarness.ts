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
  <p>We are the <span><span blink=true>B</span><span blink=true>O</span><span blink=true>R</span><span blink=true>G</span></span>. Lower your shields and surrender your ships. We will add your biological and technological distinctiveness to our own. Your culture will adapt to service us.</p>
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
  documentSource: withColor("hello world it's me"),
  characterResolution: 'single',
  displayRows: 5,
  borderColor: [0, 0, 0],
  idExtension: '1',
}).run();

declare global {
  interface Window {
    _ptr: PTR;
  }
}

window._ptr = ptr;

const buttons = [
  {
    id: 'appendToDocument',
    text: 'Append to document',
    onClick: () => {
      const text = prompt('Append to Document') ?? '';
      ptr.appendToDocument(withColor(text));
    },
  },
  {
    id: 'appendMany',
    text: 'Append Many',
    onClick: async () => {
      const text = prompt('Append to Document') ?? '';
      await ptr.appendToDocument(withColor(text), 'all');
      await ptr.appendToDocument(withColor(text), 'single');
      await ptr.appendToDocument(withColor(text));
      await ptr.appendToDocument(withColor(text));
    },
  },
  {
    id: 'setDocument',
    text: 'Set Document',
    onClick: () => {
      const text = prompt('Set Document') ?? '';
      ptr.setDocument(withColor(text), 'all');
    },
  },
  {
    id: 'reset',
    text: 'Reset Example',
    onClick: () => {
      ptr.setDocument(borgText);
    },
  },
];

const renderInto = document.getElementById('devHarnessButtons');

buttons.forEach((b) => {
  const button = document.createElement('button');
  button.id = b.id;
  button.innerText = b.text;
  button.onclick = b.onClick;
  button.style.background = color;
  renderInto?.appendChild(button);
});
