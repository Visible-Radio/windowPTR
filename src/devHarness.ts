import { PTR } from './main';
import { rgbToString } from './utils/rgbToString';
import { rgb8Bit } from './utils/typeUtils/intRange';
const colorArr = [10, 100, 254] as rgb8Bit;
const color = rgbToString(colorArr);

const borgText = `
<span color=${color}>  
  <span highlight=true>
    Resistance lololo lo<span highlight=false outline=true>is</span><span blink=true>futile</span>
  </span>
  <p>We are the <span blink=true>B</span><span blink=true>O</span><span blink=true>R</span><span blink=true>G</span>. Lower your shields and surrender your ships. We will add your biological and technological distinctiveness to our own. Your culture will adapt to service us.</p>
</span>
`;

const withColor = (text: string) => `<span color=${color}>${text}</span>`;

const ptr = new PTR(document.getElementById('root') as HTMLDivElement, {
  scale: 3,
  // displayRows: 1,
  // displayColumns: 1,
  documentSource: borgText,
  borderColor: [0, 0, 0],
  idExtension: '1',
}).run();

console.log(ptr.dm.values);

declare global {
  interface Window {
    _ptr: PTR;
  }
}

window._ptr = ptr;

const getPromptText = () => {
  return `<span color=${color} highlight=true></span>`;
};

const buttons = [
  {
    id: 'appendToDocument',
    text: 'Append to document',
    onClick: () => {
      const text = prompt('Append to Document', getPromptText()) ?? '';
      ptr.appendToDocument(text);
    },
  },
  {
    id: 'setDocument',
    text: 'Set Document',
    onClick: () => {
      const text = prompt('Set Document', getPromptText()) ?? '';
      ptr.setDocument(text);
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
