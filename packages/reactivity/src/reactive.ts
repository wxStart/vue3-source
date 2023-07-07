import { isObject } from "@vue/shared";

import { track, trigger } from "./effect";

const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
}

const handler: ProxyHandler<Record<any, any>> = {
  get(target, key, recevier) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      // 只有Proxy的对象才会返回true
      return true;
    }
    const res = Reflect.get(target, key, recevier); //相当于 target[key]
    // console.log("取值了");
    //取值的时候，可以收集他在哪个effect中
    track(target, key);
    return res;
  },
  set(target, key, value, recevier) {
    let oldVlaue = (target as any)[key];
    const res: boolean = Reflect.set(target, key, value, recevier); // 相当于 target[key]=value
    // 设置值的时候，更新effect
    // console.log("进行了设置");

    if (oldVlaue !== value) {
      trigger(target, key);
    }
    return res;
  },
};

const reactiveMap = new WeakMap(); //key是一个对象

function createReactiveObject(target: Object) {
  if (!isObject(target)) {
    return target;
  }
  /**
   *
   * 默认认为是已经代理过的,没有代理过的数据 ReactiveFlags.IS_REACTIVE属性是不存在的
   * 解决传入的事代理过的对象
   */
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }

  //
  const proxyTarget = reactiveMap.get(target);
  if (proxyTarget) {
    return proxyTarget;
  }
  // 代理对象，当用获取值和是设置值的时候做一些事情
  const proxy = new Proxy(target, handler);
  reactiveMap.set(target, proxy);
  return proxy;
}

export const reactive = function (target: Object) {
  return createReactiveObject(target);
};
