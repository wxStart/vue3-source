import { ReactiveEffect } from "@vue/reactivity";
import { createAppAPI } from "./apiCreateApp";
import { ShapeFlages } from "@vue/shared";

import { createComponentInstance, setupComponent } from "./component";
import { normalizeVNode, Text, isSameVNode } from "./createVNode";
import { h } from "./h";

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

  const mountELement = (vnode: any, container: any, auchor: any = null) => {
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
    // 插入或者移动到 某个位置之前
    hostInsert(el, container, auchor);
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
      console.log("key: ", key);
      if (!newProps[key]) {
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  };

  const unmountChildren = (children: any) => {
    for (let index = 0; index < children.length; index++) {
      unmount(children[index]);
    }
  };

  const patchKeyedChildren = (c1: any, c2: any, container: any) => {
    //
    let l1 = c1.length - 1;
    let l2 = c2.length - 1;
    let i = 0; // 从头开始比较

    // 先从头比较遇到不同的节点停止
    while (i <= l1 && i <= l2) {
      // 说明老的  或者新的 已经比完了
      const n1 = c1[i],
        n2 = c2[i];
      if (isSameVNode(n1, n2)) {
        // 是同一个节点，则需要递归比较孩子函自身属性
        patch(n1, n2, container);
      } else {
        break;
      }
      i++;
    }

    console.log("从头比：l1,l2,i: ", l1, l2, i);
    // 从后往前比 遇到不重复的就停止
    while (i <= l1 && i <= l2) {
      // 说明老的  或者新的 已经比完了
      const n1 = c1[l1],
        n2 = c2[l2];
      if (isSameVNode(n1, n2)) {
        // 是同一个节点，则需要递归比较孩子函自身属性
        patch(n1, n2, container);
      } else {
        break;
      }
      l1--;
      l2--;
    }
    console.log("从尾比：l1,l2,i: ", l1, l2, i);
    // 3. component sequence + mount
    if (i > l1) {
      //!c1=[1,2]， c2=[3,1，2]或者是 [1,3,2,] 或者是[1,2,3]
      // 说名比完了 c1
      // 说明有新增的
      // i 到 l2 之间的含头含尾
      if (i <= l2) {
        //! c2里面有多余的
        const next = l2 + 1;
        //!! 找到插入的参照物  说明是在其其那面追加
        const auchor = next < c2.length ? c2[next].el : null;
        while (i <= l2) {
          patch(null, c2[i++], container, auchor);
        }
      }
      // 4. component sequence + unmount
    } else if (i > l2) {
      // 说明 比完c2,
      //!c1=[3,1,2]或者是 [1,3,2,] 或者是[1,2,3], c2=[1，2]
      if (i <= l1) {
        // c1 里面有多余的
        while (i <= l1) {
          unmount(c1[i++]); //!移除时候会导致i进行增加
        }
      }
    }

    // unknow
    console.log('i: ', i);

    const s1 = i; //i到l1就是 老的没有处理过的孩子列表
    const s2 = i; //i到l2就是 新的没有处理过的孩子列表
    console.log('s2: ', s2);
    // 根据新的节点创建一个映射表 key:下标，用老的列表里面去找，如果没有就删除，有就复用。最后多余的去追加
    const newKeyIndexMap = new Map();

    //! 循环新的记录它在c2的下标 { key1:c2Index1, key2: c2Index2 }
    for (let index = s2; index <= l2; index++) {
      const child = c2[index];
      newKeyIndexMap.set(child.key, index); //!key:下标 c2中的下标
    }
    let handlerS2length = l2 - s2 + 1;
    handlerS2length = handlerS2length > 0 ? handlerS2length : 0;
    const newIndexMapHanded = new Array(handlerS2length).fill(0);


    //! 循环旧的   不在 c2的记录数组中就是要删除，在的就是直接比对
    for (let index = s1; index <= l1; index++) {
      // ! 新的索引 影射到老的索引
      const child = c1[index];
      const newIndex = newKeyIndexMap.get(child.key); //! 找到在新的里面的下标 c2中的下标
      if (newIndex == undefined) {
        unmount(c1[index]);
      } else {
        // 说明可以复用
        newIndexMapHanded[newIndex - s2] = index + 1;
        // 还要比对孩子
        patch(child, c2[newIndex], container);
      }
    }
    console.log("newIndexMapHanded: ", newIndexMapHanded); //! c2中 s2到l2 对应c1中的下标加1 只是个真假值判断是不是以前的元素直接使用el

     //! 最后根据 newIndexMapHanded 数组的内容进行渲染， 值为0的就是代新建的， 不为0的就是要挪动的
     //! 需要倒序创建
    for (let index = handlerS2length - 1; index >= 0; index--) {
      let lastIndex = s2 + index;
      let lastChild = c2[lastIndex];
      const auchor = lastIndex + 1 < c2.length ? c2[lastIndex + 1].el : null;
      if (newIndexMapHanded[index] === 0) {
        // 创建节点后插入
        patch(null, lastChild, container, auchor);
      } else {
        //这里有消耗的 
        // 采用最长自增子序列 减少dom操作
        hostInsert(lastChild.el, container, auchor);
      }
    }
  };

  const patchChildren = (oldVnode: any, newVnode: any, el: any) => {
    const c1 = oldVnode && oldVnode.children;
    const c2 = oldVnode && newVnode.children;

    const preveShapeFlages = oldVnode.shapeFlages;
    const shapeFlages = newVnode.shapeFlages;
    // 1. 之前是数组，现在是文本  删除老节点，用新文本替换
    // 2. 之前是数组，现在也是数组  比较两个儿子的列表差异
    // 3. 之前是文本， 现在是空 直接删除老的
    // 4. 之前是文本，现在也是文本，直接更新文本
    // 5. 之前是文本 现在是数组  删除文本新增儿子
    // 6. 之前是空  现在是文本
    // 7. 之前是数组， 现在是空 删除老节点

    // 现在是文本
    if (shapeFlages & ShapeFlages.TEXT_CHILDREN) {
      //!!! 隐含 ShapeFlages.ARRAY_CHILDREN 就是空的时候  c2村子 就是 情况6
      // 情况1  之前是数组  现在是文本
      if (preveShapeFlages & ShapeFlages.ARRAY_CHILDREN) {
        unmountChildren(c1);
        console.log(1);
      }
      // 情况4 之前是文本  现在也是文本
      // 情况6 之前是空   现在是文本
      if (c1 !== c2) {
        // 两个文本比对 情况四
        // 说明没走到  ShapeFlages.ARRAY_CHILDREN  只可能是文本
        hostSetElementText(el, c2);
        console.log(4, 6);
      }
    } else if (shapeFlages & ShapeFlages.ARRAY_CHILDREN) {
      // 情况2  现在是数组  之前也是数组
      if (preveShapeFlages & ShapeFlages.ARRAY_CHILDREN) {
        //!!! DIFF
        patchKeyedChildren(c1, c2, el);
      } else {
        // 情况5  之前是文本或者是空   现在是数组
        hostSetElementText(el, ""); // 先清空再挂载新的
        mountChildren(c2, el);
        console.log(5);
      }
    } else {
      // 情况3 现在是空
      if (preveShapeFlages & ShapeFlages.ARRAY_CHILDREN) {
        unmountChildren(c1);
        console.log(7);
      }
      console.log(3);
      hostSetElementText(el, "");
    }
  };

  const patchElement = (prevVn: any, nextVn: any) => {
    let el = (nextVn.el = prevVn.el);
    const oldProps = prevVn.props || {};
    const newProps = nextVn.props || {};
    patchProps(oldProps, newProps, el); // 属性比较完了

    // diff 比较孩子了
    patchChildren(prevVn, nextVn, el);
  };
  /** patchElement end*/

  const processElemet = (
    prevVn: unknown,
    nextVn: unknown,
    container: unknown,
    auchor: any = null
  ) => {
    if (prevVn === null) {
      // 元素初始化
      mountELement(nextVn, container, auchor);
    } else {
      patchElement(prevVn, nextVn);
    }
  };

  /** processElemet end*/

  const processText = (prevVn: any, nextVn: any, container: any) => {
    if (prevVn === null) {
      // 文本初始化
      const textNode = hostCreateText(nextVn.children);
      nextVn.el = textNode;
      hostInsert(textNode, container);
    } else {
    }
  };

  const unmount = (vnode: any) => {
    console.log("卸载了vnode: ", vnode.el);
    hostRemove(vnode.el);
  };

  const patch = (
    prevVn: unknown,
    nextVn: unknown,
    container: unknown,
    auchor: any = null
  ) => {
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
          processElemet(prevVn, nextVn, container, auchor);
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
