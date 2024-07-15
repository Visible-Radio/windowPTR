import { runPTR } from './lib/PTR';
import { PTR } from './main';

const borgText = `
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

const ptr = new PTR(document.getElementById('root') as HTMLDivElement, {
  scale: 5,
  displayRows: 4,
  documentSource: borgText,
});

runPTR(ptr);

// import { createPTR } from "./lib/createPTR";
// import { neuromancerText } from "./sampleText/neuromancer";

// const PTR = createPTR(document.getElementById("root") as HTMLDivElement, {
//   scale: 2,
// });

// declare global {
//   interface Window {
//     _PTR: typeof PTR;
//   }
// }

// window._PTR = PTR;

// const borgText = `
// <span>
//   <span outline=true>
//     Resistance is futile
//   </span>
//   <p highlight=true>
//     Resistance is futile
//   </p>
//   <p>We are the Borg. Lower your shields and surrender your ships. We will add your biological and technological distinctiveness to our own. Your culture will adapt to service us.</p>
// </span>
// `;

// PTR.actions.setText(borgText);

// const buttons = [
//   {
//     id: "pageUp",
//     text: "page up",
//     onClick: () => {
//       window._PTR.actions.pageUp();
//     },
//   },
//   {
//     id: "pageDown",
//     text: "page down",
//     onClick: () => {
//       window._PTR.actions.pageDown();
//     },
//   },
//   {
//     id: "home",
//     text: "home",
//     onClick: () => {
//       window._PTR.actions.home();
//     },
//   },
//   {
//     id: "end",
//     text: "end",
//     onClick: () => {
//       window._PTR.actions.end();
//     },
//   },

//   {
//     id: "setText",
//     text: "set text",
//     onClick: () => {
//       const text = prompt("Define display text");
//       window._PTR.actions.setText(text ?? "");
//     },
//   },
//   {
//     id: "resetText",
//     text: "EXAMPLE",
//     onClick: () => {
//       window._PTR.actions.setText(neuromancerText);
//     },
//   },
//   {
//     id: "appendText",
//     text: "append text",
//     onClick: () => {
//       const text = prompt("Append Text");
//       window._PTR.actions.appendText(text ?? "");
//     },
//   },
// ];

// const renderInto = document.getElementById("devHarnessButtons");

// buttons.forEach(b => {
//   const button = document.createElement("button");
//   button.id = b.id;
//   button.innerText = b.text;
//   button.onclick = b.onClick;
//   renderInto?.appendChild(button);
// });
