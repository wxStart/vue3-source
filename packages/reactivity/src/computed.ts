/**
 *
 * 1. 计算属性 默认不执行，取值才会执行
 * 2. 属性值变了才会重新执行dirty属性缓存
 */

type GetSet = {
  get: Function;
  set: Function;
};

type GetOptions = Function | GetSet;
import { isFunction } from "@vue/shared";
import {
  ReactiveEffect,
  isTracking,
  trackEffect,
  triggerEffects,
} from "./effect";

class ComputedRefImpl {
  public deps: Set<ReactiveEffect> = new Set();
  public dirty = true;
  public effect: ReactiveEffect;
  public __v_isRef = true;
  public _value: any;

  constructor(getter: Function, public setter: Function) {
    this.effect = new ReactiveEffect(getter, () => {
      // 计算属性依赖值改变，调用此函数
      if (!this.dirty) {
        this.dirty = true;
        //  依赖计算属性的effect执行
        triggerEffects(this.deps);
      }
    });
  }

  get value() {
    if (isTracking()) {
      // 取值的时候会进行 effect中用到了计算属性 才会进行effect依赖收集
      trackEffect(this.deps);
    }
    if (this.dirty) {
      // 作缓存用的，避免每次取值都调用run
      console.log("开始收集");
      this._value = this.effect.run(); // 返回的是getter函数的执行结果，顺便进行了计算属性所依赖的属性的依赖收集
      this.dirty = false;
    }
    return this._value;
  }

  set value(newValue) {
    if (this._value !== newValue) {
      this.dirty = true;
    }
    this.setter(newValue);
  }
}

export const computed = function (getOptions: GetOptions) {
  const onlyGetter = isFunction(getOptions);
  let getter: Function;
  let setter: Function;

  if (onlyGetter) {
    getter = getOptions as Function;
    setter = () => {};
  } else {
    getter = (getOptions as GetSet).get;
    setter = (getOptions as GetSet).set;
  }
  return new ComputedRefImpl(getter, setter);
};
