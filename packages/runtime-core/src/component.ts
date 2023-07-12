import { reactive } from "@vue/reactivity";
import { isFunction, isObject } from "@vue/shared";
function createSetupContext(instance: any) {
  return {
    attrs: instance.attrs,
    emit: instance.emit,
    slots: instance.slots,
    expose: (exposed: any) => {
      instance.expose = exposed;
    },
  };
}
const publicInstanceProxyHandlers = {
  // @ts-ignore
  get({ _: instance }, key: string) {
    const { setupState, props } = instance;
    return setupState[key] || props[key];
  },
  set() {
    // 就不进行修改了
    return false;
  },
};

export function setupStatefulComponent(instance: any) {
  // 调用组件的setup方法
  const Component = instance.type;
  const { setup } = Component;
  // instance
  instance.proxy = new Proxy(instance.ctx, publicInstanceProxyHandlers);
  if (setup) {
    const setupContext = createSetupContext(instance);
    let setupReuslt = setup(instance.props, setupContext);
    if (isFunction(setupReuslt)) {
      instance.render = setupReuslt;
    } else if (isObject(setupReuslt)) {
      instance.setupState = setupReuslt;
    }
  }
  if (!instance.render) {
    // 也有可能没有Component.render; 而写的是template就是另一种 现在不考虑
    instance.render = Component.render;
  }

}

export function initProps(instance: any, rawProps: any) {
  const props = {};
  const attrs = {};
  const options = Object.keys(instance.propsOptions);
  if (rawProps) {
    for (const key in rawProps) {
      const value = rawProps[key];
      if (options.includes(key)) {
        // @ts-ignore
        props[key] = value;
      } else {
        // @ts-ignore
        attrs[key] = value;
      }
    }
  }
  instance.props = reactive(props);
  instance.attrs = attrs;
}

export function setupComponent(instance: any) {
  const { props, children } = instance.vnode;
  initProps(instance, props);
  setupStatefulComponent(instance);
}

export function createComponentInstance(vnode: any) {
  const type = vnode.type;
  const instance = {
    vnode,
    type, // 组件对象
    subTree: null, // 组件的渲染结果
    ctx: {}, // 组件的上下文
    props: {},
    attrs: {},
    slots: {},
    setupState: {},
    propsOptions: type.props,
    proxy: null, // 实例的代理对象
    render: null, // 渲染函数
    emit: null,
    exposed: {}, // 暴露的方法
    isMounted: false,
  };
  instance.ctx = { _: instance };
  return instance;
}
