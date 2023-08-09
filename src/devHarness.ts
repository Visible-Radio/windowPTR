import { neuromancerText } from "./sampleText/neuromancer";

const buttons = [
  {
    id: "pageUp",
    text: "page up",
    onClick: () => {
      window._PTR.actions.pageUp();
    },
  },
  {
    id: "pageDown",
    text: "page down",
    onClick: () => {
      window._PTR.actions.pageDown();
    },
  },
  {
    id: "home",
    text: "home",
    onClick: () => {
      window._PTR.actions.home();
    },
  },
  {
    id: "end",
    text: "end",
    onClick: () => {
      window._PTR.actions.end();
    },
  },

  {
    id: "setText",
    text: "set text",
    onClick: () => {
      const text = prompt("Define display text");
      window._PTR.actions.setText(text ?? "");
    },
  },
  {
    id: "resetText",
    text: "EXAMPLE",
    onClick: () => {
      window._PTR.actions.setText(neuromancerText);
    },
  },
  {
    id: "appendText",
    text: "append text",
    onClick: () => {
      const text = prompt("Append Text");
      window._PTR.actions.appendText(text ?? "");
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
