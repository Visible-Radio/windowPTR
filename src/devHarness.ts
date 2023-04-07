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
    id: "scaleInc",
    text: "scale +",
    onClick: () => {
      window._PTR.setScale(store.getState().dm.scale + 1);
    },
  },
  {
    id: "scaleDec",
    text: "scale -",
    onClick: () => {
      window._PTR.setScale(store.getState().dm.scale - 1);
    },
  },
  {
    id: "gapXInc",
    text: "gap x +",
    onClick: () => {
      window._PTR.setGridSpaceX(store.getState().dm.gridSpaceX_du + 1);
    },
  },
  {
    id: "gapXDec",
    text: "gap x -",
    onClick: () => {
      window._PTR.setGridSpaceX(store.getState().dm.gridSpaceX_du - 1);
    },
  },
  {
    id: "gapYInc",
    text: "gap y +",
    onClick: () => {
      window._PTR.setGridSpaceY(store.getState().dm.gridSpaceY_du + 1);
    },
  },
  {
    id: "gapYDec",
    text: "gap y -",
    onClick: () => {
      window._PTR.setGridSpaceY(store.getState().dm.gridSpaceY_du - 1);
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
  {
    id: "setRows",
    text: "set rows",
    onClick: () => {
      window._PTR.setRows(Number(prompt("row count") ?? 5));
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
