/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import { createEffect, Signal } from "./signals.ts";

type FunctionComponent = {
  // deno-lint-ignore no-explicit-any
  props: any;
  children?: Node["children"];
  component: (
    props: FunctionComponent["props"],
    children?: FunctionComponent["children"],
  ) => Node;
};

export type Node = {
  type: keyof HTMLElementTagNameMap;
  // deno-lint-ignore no-explicit-any
  attributes?: Record<string, any>;
  // deno-lint-ignore no-explicit-any
  children: (Node | string | Signal<any> | FunctionComponent)[];
};

// deno-lint-ignore no-explicit-any
function isFunctionComponent(node: any): node is FunctionComponent {
  return node.component !== undefined;
}

// deno-lint-ignore no-explicit-any
function signalToString(signal: Signal<any>): string {
  if (signal.state === undefined) return "";
  if (typeof signal.state === "object") return JSON.stringify(signal.state);
  return signal.state.toString();
}

function updateDom(
  parent: HTMLElement,
  newDom: HTMLElement,
  oldDom: HTMLElement,
): void {
  parent.replaceChild(newDom, oldDom);
}

export function render(
  // deno-lint-ignore no-explicit-any
  node: Node | string | Signal<any> | FunctionComponent,
  parentDom: HTMLElement | null,
  oldDom?: HTMLElement,
): HTMLElement {
  if (!parentDom) {
    throw Error("DOM is not exist.");
  }

  if (typeof node === "string") {
    parentDom.textContent = node;
    return parentDom;
  }

  if (isFunctionComponent(node)) {
    const comp = node.component(node.props, node.children);
    let dom = render(comp, parentDom);

    const deps = Object.values(node.props).filter((
      // deno-lint-ignore no-explicit-any
      prop: any,
    // deno-lint-ignore no-explicit-any
    ): prop is Signal<any> => prop instanceof Signal);

    createEffect(() => {
      const comp = node.component(node.props, node.children);
      dom = render(comp, parentDom, dom);
    }, deps);
    return parentDom;
  }

  if (node instanceof Signal) {
    parentDom.textContent = signalToString(node);
    createEffect(() => {
      parentDom.textContent = signalToString(node);
    }, [node]);
    return parentDom;
  }

  const element = document.createElement(node.type);
  Object.entries(node?.attributes ?? {}).forEach(([k, v]) => {
    if (k.includes("on:")) {
      element.addEventListener(k.split("on:")[1], v);
      return;
    }
    element.setAttribute(k, v);
  });

  if (oldDom) {
    updateDom(parentDom, element, oldDom);
  } else {
    parentDom.appendChild(element);
  }

  node.children.forEach((child) => render(child, element));

  return element;
}

export function renderToString(
  // deno-lint-ignore no-explicit-any
  node: Node | string | Signal<any> | FunctionComponent,
): string {
  if (typeof node === "string") {
    return node;
  }

  if (node instanceof Signal) {
    return signalToString(node);
  }

  if (isFunctionComponent(node)) {
    const comp = node.component(node.props, node.children);
    return renderToString(comp);
  }

  if (node.type === undefined) {
    return node.children.map((child) => renderToString(child)).join("");
  }

  const html = `<${node.type}>${
    node.children.map((child) => renderToString(child)).join("")
  }</${node.type}>`;
  return html;
}
