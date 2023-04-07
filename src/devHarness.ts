import { store } from "./lib/state/state";
import { neuromancerText } from "./sampleText/neuromancer";

const buttons = [
  {
    id: "pageUp",
    text: "page up",
    onClick: () => {
      window._PTR.pageUp();
    },
  },
  {
    id: "pageDown",
    text: "page down",
    onClick: () => {
      window._PTR.pageDown();
    },
  },
  {
    id: "home",
    text: "home",
    onClick: () => {
      window._PTR.home();
    },
  },
  {
    id: "end",
    text: "end",
    onClick: () => {
      window._PTR.end();
    },
  },

  {
    id: "setText",
    text: "set text",
    onClick: () => {
      const text = prompt("Define display text");
      window._PTR.setSimpleText(text ?? store.getState().simpleText);
    },
  },
  {
    id: "resetText",
    text: "EXAMPLE",
    onClick: () => {
      window._PTR.setSimpleText(neuromancerText);
    },
  },
];

const renderInto = document.getElementById("devHarnessButtons");

buttons.forEach(b => {
  const button = document.createElement("button");
  button.id = b.id;
  button.innerText = b.text;
  button.onclick = b.onClick;
  renderInto?.appendChild(button);
});
