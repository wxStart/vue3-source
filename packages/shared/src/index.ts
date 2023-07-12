export function isObject(value: unknown): value is Record<any, any> {
  return typeof value === "object" && value !== null;
}
export function isFunction(value: unknown): value is Record<any, any> {
  return typeof value === "function";
}
export function isString(value: unknown): value is Record<any, any> {
  return typeof value === "string";
}

export const enum ShapeFlages {
  ELEMENT = 1, // 元素
  FUNCTIONAL_COMPONENT = 1 << 1, // 函数式组件
  STATEFUL_CONPONENT = 1 << 2, // 普通组件
  TEXT_CHILDREN = 1 << 3, // 孩子是文本
  ARRAY_CHILDREN = 1 << 4, //孩子是数组
  SLOTS_CHILDREN = 1 << 5, // 组件插槽
  TELEPORT = 1 << 6, // teleport组件
  SUSPENSE = 1 << 7, // suspense组件
  COMPONENT = ShapeFlages.STATEFUL_CONPONENT | ShapeFlages.FUNCTIONAL_COMPONENT, // 组件
  // | 组合权限     c= a | b;
  // & 判断权限     hasA = c & a
}
