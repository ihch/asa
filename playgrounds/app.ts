/// <reference lib="dom" />
import { render, renderToString } from "../src/index.ts";
import { Node } from "../src/asa.ts";
import { createMemo, createSignal, Signal } from "../src/signals.ts";
import styles from "./index.module.css";

const Button = (
  { count, onClick }: { count: Signal<number>; onClick: () => void },
): Node => {
  const buttonStyles = styles["button"] + " " +
    (count.state % 2 ? styles["-teal"] : styles["-blue"]);

  return {
    type: "button",
    attributes: {
      "on:click": onClick,
      "class": buttonStyles,
    },
    children: [`button ${count.state}`],
  };
};

const ButtonWithState = (): Node => {
  const count = createSignal(0);
  const buttonStyles = createMemo(() => {
    return styles["button"] + " " +
      (count.state % 2 ? styles["-teal"] : styles["-blue"]);
  }, [count]);
  const onClick = () => count.setState((current) => current + 1);

  return {
    type: "button",
    attributes: {
      "on:click": onClick,
      "class": buttonStyles,
    },
    children: [createMemo(() => `button ${count.state}`, [count])],
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
      {
        props: {},
        component: ButtonWithState,
      },
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
