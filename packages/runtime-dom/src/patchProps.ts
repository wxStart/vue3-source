const patchClass = (el: HTMLElement, value: unknown) => {
  if (value === null) {
    el.removeAttribute("class");
  } else {
    el.className = value as string;
  }
};

const patchStyle = (el: HTMLElement, prev: object | null, next: object) => {
  const style = el.style;
  for (const keyName in next) {
    // @ts-ignore
    style[keyName] = next[keyName];
  }
  if (prev) {
    for (const key in prev) {
      // @ts-ignore
      if (next[key] === null) {
        // @ts-ignore
        style[key] = null;
      }
    }
  }
};

function createInvoker(fn: Function) {
  const invoker = (e: EventTarget) => {
    invoker.value(e);
  };
  invoker.value = fn;
  return invoker;
}

const patchEvent = (el: HTMLElement, key: string, next: Function) => {
  // @ts-ignore
  const invokers = el._vei || (el._vei = {});

  const name = key.slice(2).toLowerCase();
  const listennerInvoker = invokers[key];

  if (listennerInvoker && next && listennerInvoker.value !== next) {
    // 事件换绑，之前绑定过，现在需要换绑
    listennerInvoker.value = next;
  } else {
    if (next) {
      // 第一次绑定
      const invoker = (invokers[key] = createInvoker(next));
      //   @ts-ignore
      el.addEventListener(name, invoker); // invoker 执行的时候 执行的是invoker.value也就是next传的函数
    } else if (listennerInvoker) {
      // 需要解绑
      el.removeEventListener(name, listennerInvoker);
      invokers[key] = undefined;
    }
  }
};

const patchAttr = (el: HTMLElement, key: string, value: string) => {
  if (value === null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, value);
  }
};

// 比对属性
export const patchProp = (
  el: HTMLElement,
  key: string,
  prevValue: unknown,
  nextVlaue: unknown
) => {
  if (key === "class") {
    // 类名
    patchClass(el, nextVlaue);
  } else if (key === "style") {
    patchStyle(el, prevValue as object, nextVlaue as object);
  } else if (/^on[^a-z]/.test(key)) {
    // 事件
    patchEvent(el, key, nextVlaue as Function);
  } else {
    patchAttr(el, key, nextVlaue as string);
  }
};
