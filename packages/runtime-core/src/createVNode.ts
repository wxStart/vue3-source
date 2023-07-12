import { isObject, isString, ShapeFlages } from "@vue/shared";

export function createVNode(type: any, props: any, children: any = null) {
  // 虚拟节点   用一个对象来描述信息，比如描述dom元素
  const shapeFlages = isObject(type)
    ? ShapeFlages.COMPONENT
    : isString(type)
    ? ShapeFlages.ELEMENT
    : 0;

  const vnode = {
    __v_isVNode: true,
    type,
    shapeFlages,
    props,
    children,
    key: props && props.key,
    component: null, // 如果组件，需要保存组件的实例
    el: null, // 虚拟节点对应的真实节点
  };

  if (children) {
    vnode.shapeFlages |= isString(children)
      ? ShapeFlages.TEXT_CHILDREN
      : ShapeFlages.ARRAY_CHILDREN;
    //  shapeFlages就知道儿子是什么类型的  到时候再使用& 运算进行处理  知道是文本还是数组
  }

  return vnode;
}

export function isVNode(value: any) {
  return !!value.__v_isVNode;
}

export const Text = Symbol();

export function normalizeVNode(vnode: any) {
  if (isObject(vnode)) {
    return vnode;
  }
  return createVNode(Text, null, String(vnode));
}

export const isSameVNode = (n1: any, n2: any) => {
  return n1.type == n2.type && n1.key == n2.key;
};
