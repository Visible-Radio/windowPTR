import { createPTR } from "./lib/createPTR";

const PTR = createPTR(document.getElementById("root") as HTMLDivElement, {
  scale: 2,
});

declare global {
  interface Window {
    _PTR: typeof PTR;
  }
}

window._PTR = PTR;

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

PTR.actions.setText(borgText);
