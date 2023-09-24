/// <reference lib="dom" />
import { render, renderToString } from "../src/index.ts";
import { Node } from "../src/asa.ts";
import { createSignal, Signal } from "../src/signals.ts";

const Button = (
  { count, onClick }: { count: Signal<number>; onClick: () => void },
): Node => {
  return {
    type: "button",
    attributes: {
      "on:click": onClick,
    },
    children: [`button ${count.state}`],
  };
};

const Counter = ({ count }: { count: Signal<number> }): Node => {
  return {
    type: "div",
    children: [`Counter: ${count.state}`],
  };
};

const App = (): Node => {
  const count = createSignal(0);

  return {
    type: "div",
    children: [
      {
        props: { count, onClick: () => count.setState((prev) => prev + 1) },
        component: Button,
      },
      { props: { count }, component: Counter },
    ],
  };
};

const node: Node = {
  type: "div",
  children: [
    "text node",
    { type: "p", children: ["hoge"] },
    { type: "p", children: ["paragraph"] },
    { props: {}, component: App },
  ],
};

render(
  node,
  document.querySelector("#app"),
);

const html = renderToString(node);

console.log("renderToString:", html);
