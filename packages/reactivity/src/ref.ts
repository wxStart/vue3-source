import {
  ReactiveEffect,
  isTracking,
  trackEffect,
  triggerEffects,
} from "./effect";
import { reactive } from "./reactive";
import { isObject } from "@vue/shared";

export function toReactive(value: unknown) {
  return isObject(value) ? reactive(value) : value;
}

class RefImpl {
  public deps: Set<ReactiveEffect> = new Set();
  public __v_isRef = true;
  public _value: unknown;
  constructor(public _rawValue: unknown) {
    this._value = toReactive(_rawValue);
  }
  get value() {
    if (isTracking()) {
      // 取值的时候会进行 effect中用到了计算属性 才会进行effect依赖收集
      trackEffect(this.deps);
    }
    return this._value;
  }
  set value(newValue) {
    if (this._rawValue !== newValue) {
      this._rawValue = newValue;
      this._value = toReactive(newValue);
      triggerEffects(this.deps);
    }
  }
}

function createRef(value: unknown) {
  return new RefImpl(value);
}

export const ref = function (value: unknown) {
  return createRef(value);
};
