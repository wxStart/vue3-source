export const nodeOpts = {
  insert(child: HTMLElement, parent: HTMLElement, anchor:any = null) {
    parent.insertBefore(child, anchor); // anchor 为null 相当于 parent.appendChild(cihld)
  },

  remove(child: HTMLElement) {
    const parent: ParentNode | null = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },

  createElement: (tag: string): HTMLElement => document.createElement(tag),

  createText: (text: string): Text => document.createTextNode(text),

  setElementText: (el: HTMLElement, text: string) => (el.textContent = text),

  setText: (node: Node, text: string) => (node.nodeValue = text),

  parentNode: (node: Node) => node.parentNode,

  nextSibling: (node: Node) => node.nextSibling,

  querySelector: (selector: string) => document.querySelector(selector),
};
