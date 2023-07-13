import { ReactiveEffect } from "@vue/reactivity";
import { createAppAPI } from "./apiCreateApp";
import { ShapeFlages } from "@vue/shared";

import { createComponentInstance, setupComponent } from "./component";
import { normalizeVNode, Text, isSameVNode } from "./createVNode";

// function createAppAPI(render: Function) {
//   return (component: object, rootProps: object | null) => {
//     const app = {
//       mount(container: any) {
//         // render(vnode, container);
//       },
//       use() {},
//     };
//     return app;
//   };
// }

export function createRenderer(renderOptios: any) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setElementText: hostSetElementText,
    setText: hostSetText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    querySelector: hostQuerySelector,
    patchProp: hostPatchProp,
  } = renderOptios;

  const setupRenderEffect = (initVnode: any, instance: any, container: any) => {
    const componentUpdateFn = () => {
      let { proxy } = instance;
      if (!instance.isMounted) {
        // 组件初始化流程
        // 渲染页面时候会进行依赖收集
        const subTree = instance.render.call(proxy, proxy); // 调用的是h函数也返回的是vnode
        instance.subTree = subTree;

        patch(null, instance.subTree, container);

        instance.isMounted = true;
      } else {
        console.log("重新渲染了");
        // 更新组件流程

        const prevTree = instance.subTree;
        const nextTree = instance.render.call(proxy, proxy);
        instance.subTree = nextTree;
        patch(prevTree, nextTree, container);
      }
    };
    const effect = new ReactiveEffect(componentUpdateFn);
    const update = effect.run.bind(effect);
    update();
  };

  const mountComponent = (initVn: any, container: any) => {
    //1. 根据虚拟节点，生成真实节点
    const instance = (initVn.component = createComponentInstance(initVn));
    //2 处理 instance的属性
    setupComponent(instance);
    // 3.执行render
    setupRenderEffect(initVn, instance, container);
  };

  const processComponent = (
    prevVn: unknown,
    nextVn: unknown,
    container: unknown
  ) => {
    if (prevVn === null) {
      // 组件初始化
      mountComponent(nextVn, container);
    } else {
    }
  };

  /** processElemet start*/
  /** mountELement start*/
  const mountChildren = (children: any, parent: any) => {
    for (let i = 0; i < children.length; i++) {
      const child = (children[i] = normalizeVNode(children[i]));
      patch(null, child, parent);
    }
  };

  const mountELement = (vnode: any, container: any) => {
    let { type, props, shapeFlages, children } = vnode;

    const el = (vnode.el = hostCreateElement(type));

    if (shapeFlages & ShapeFlages.TEXT_CHILDREN) {
      hostSetElementText(el, children);
    } else if (shapeFlages & ShapeFlages.ARRAY_CHILDREN) {
      mountChildren(children, el);
    }

    // 处理属性
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }

    hostInsert(el, container);
  };
  /** mountELement end*/

  /** patchElement start*/
  const patchProps = (oldProps: any, newProps: any, el: any) => {
    if (oldProps === newProps) return;
    for (const key in newProps) {
      const prev = oldProps[key];
      const next = newProps[key];
      if (prev !== next) {
        hostPatchProp(el, key, prev, next);
      }
    }
    for (const key in oldProps) {
      if (!newProps[key]) {
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  };

  const patchElement = (prevVn: any, nextVn: any) => {
    let el = (nextVn.el = prevVn.el);
    const oldProps = prevVn.props || {};
    const newProps = nextVn.props || {};
    patchProps(oldProps, newProps, el);// 属性比较完了 

    // diff 比较孩子了
  };
  /** patchElement end*/

  const processElemet = (
    prevVn: unknown,
    nextVn: unknown,
    container: unknown
  ) => {
    if (prevVn === null) {
      // 元素初始化
      mountELement(nextVn, container);
    } else {
      patchElement(prevVn, nextVn);
    }
  };

  /** processElemet end*/

  const processText = (prevVn: any, nextVn: any, container: any) => {
    if (prevVn === null) {
      // 文本初始化
      const textNode = hostCreateText(nextVn.children);
      hostInsert(textNode, container);
    } else {
    }
  };

  const unmount = (vnode: any) => {
    console.log("卸载了vnode: ", vnode.el);
    hostRemove(vnode.el);
  };

  const patch = (prevVn: unknown, nextVn: unknown, container: unknown) => {
    // 两个元素没有任何关系
    if (prevVn && !isSameVNode(prevVn, nextVn)) {
      unmount(prevVn);
      prevVn = null;
      // 继续走初始化话的流程
    }

    if (prevVn === nextVn) return;
    //@ts-ignore
    const { shapeFlages, type } = nextVn;
    switch (type) {
      case Text:
        processText(prevVn, nextVn, container);
        break;

      default:
        if (shapeFlages & ShapeFlages.COMPONENT) {
          processComponent(prevVn, nextVn, container);
        } else if (shapeFlages & ShapeFlages.ELEMENT) {
          processElemet(prevVn, nextVn, container);
        }
    }
  };
  const render = (vnode: unknown, container: unknown) => {
    // 将虚拟节点 渲染到容器中
    patch(null, vnode, container);
  };
  return {
    createApp: createAppAPI(render),
    render,
  };
}
