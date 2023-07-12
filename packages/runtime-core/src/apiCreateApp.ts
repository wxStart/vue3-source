// import { isObject, isString, ShapeFlages } from "@vue/shared";

// function createVNode(type: any, props: any, children = null) {
//   // 虚拟节点   用一个对象来描述信息，比如描述dom元素
//   const shapeFlages = isObject(type)
//     ? ShapeFlages.COMPONENT
//     : isString(type)
//     ? ShapeFlages.ELEMENT
//     : 0;

//   const vnode = {
//     __v_isVNode: true,
//     type,
//     shapeFlages,
//     props,
//     children,
//     key: props && props.key,
//     component: null, // 如果组件，需要保存组件的实例
//     el: null, // 虚拟节点对应的真实节点
//   };

//   if (children) {
//     vnode.shapeFlages |= isString(children)
//       ? ShapeFlages.TEXT_CHILDREN
//       : ShapeFlages.ARRAY_CHILDREN;
//     //  shapeFlages就知道儿子是什么类型的  到时候再使用& 运算进行处理  知道是文本还是数组
//   }

//   return vnode;
// }

import { createVNode } from "./createVNode";
export function createAppAPI(render: Function) {
  return (rootComponent: object, rootProps: object | null) => {
    let isMounted = false;
    const app = {
      mount(container: any) {
        // render(vnode, container);
        //  1. 创建虚拟节点
        let vnode = createVNode(rootComponent, rootProps);
        console.log("vnode: ", vnode);
        //  2. 将虚拟节点渲染到容器中
        render(vnode, container);
        if (!isMounted) {
          isMounted = true;
        }
      },
    };
    return app;
  };
}
