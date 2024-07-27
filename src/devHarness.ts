import { generateRandomColors } from './lib/utils';
import { PTR } from './main';

const borgText = `
<span color=rgb(10,100,255)>  
  <span highlight=true >
    Resistance <span highlight=false outline=rgb(10,10,230)>is</span> futile
  </span>
  <p>We are the Borg. Lower your shields and surrender your ships. We will add your biological and technological distinctiveness to our own. Your culture will adapt to service us.</p>
</span>
`;

const ptr = new PTR(document.getElementById('root') as HTMLDivElement, {
  scale: 5,
  displayRows: 10,
  // displayColumns: 1,
  documentSource: borgText,
  borderWidth_du: 0,
  borderColor: [0, 0, 0],
});

ptr.run();

declare global {
  interface Window {
    _ptr: PTR;
  }
}

window._ptr = ptr;

const getPromptText = () => {
  return `<span color=${generateRandomColors()} highlight=true></span>`;
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
  renderInto?.appendChild(button);
});
