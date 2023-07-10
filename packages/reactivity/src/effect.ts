/**
 * effect1(()=>{
 *  state.name
 *
 *  effect2(()=>{
 *          state.age
 *      });
 *
 *  state.other
 * })
 * 为了记录属性和 effect的关系： 执行 effect1 时候 activeEffect = effect1，执行 effect2时候 activeEffect =  effect2  ，effect2 执行完毕后  activeEffect = effect1;
 * 1. 执行effect时候，把当前effect  push到 effectStack 中，同时改变activeEffect
 * 2 当前effect执行完毕，effectStack.pop() 同时设置activeEffect 为 effectStack的最后一个。【effect1，effect2】，effect2执行完成 activeEffect要设置成effect1
 *
 */

let effectStack: Array<ReactiveEffect> = [];

let activeEffect: ReactiveEffect;

class ReactiveEffect {
  //让effect 记录依赖了那些属性， 同时记录当前属性依赖了那些effect
  public active = true;
  public deps: Array<Set<ReactiveEffect>> = [];
  constructor(public fn: Function) {}
  run() {
    // 调用fn执行一次
    if (!this.active) {
      return this.fn();
    }

    if (!effectStack.includes(this)) {
      //屏蔽在同一个effect中进行依赖的赋值
      try {
        activeEffect = this;
        effectStack.push(activeEffect);
        // console.log("effectStack: ", effectStack);
        this.fn(); // 执行fn的时候就会访问reactive对象的属性，也就执行 reactiveProxy对象的get方法，进行属性和effect的对应收集
      } finally {
        // 内层的effect执行完毕，需要把 activeEffect 改为外层的effect
        effectStack.pop();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  }
  stop() {
    if (this.active) {
      clearEffect(this);
      this.active = false;
    }
  }
}

function clearEffect(effect: ReactiveEffect) {
  // deps实际上就是引用的 targetMapObject.get(key)  删除这里就相当于删除 targetMap中的值
  //  trigger 的时候就会执行 targetMap.get(target);中的值
  const { deps } = effect; 
  for (const depset of deps) {
    console.log("depset: ", depset);
    depset.delete(effect);
  }
}

export const isTracking = function () {
  return activeEffect !== undefined;
};
/**
 *
 * 对象属性：对应多个effect,
 *
 * 一个effect依赖多个属性，
 *
 *
 */
const targetMap = new WeakMap();

export const track = function (target: Record<any, any>, key: string | symbol) {
  // 对象的属性 和activeEffect 对应关系
  // console.log("target: ", target);
  // console.log("key: ", key);
  // console.log("activeEffect: ", activeEffect);

  // 在effect中的才需要收集
  if (!isTracking()) {
    return;
  }
  let targetMapObject = targetMap.get(target);
  if (!targetMapObject) {
    targetMapObject = new Map();
    targetMap.set(target, targetMapObject);
  }
  // {对象: {key:[effect1,effect2]} }

  let keyDepMap = targetMapObject.get(key);
  if (!keyDepMap) {
    keyDepMap = new Set();
    targetMapObject.set(key, keyDepMap);
  }
  if (!keyDepMap.has(activeEffect)) {
    keyDepMap.add(activeEffect);
    // 给当前的effect 收集 他所依赖的属性对应的effect数组
    activeEffect.deps.push(keyDepMap);
  }
};

// 对象某个属性变了，才会执行属性对应的effect
export const trigger = function (
  target: Record<any, any>,
  key: string | symbol
) {
  let targetMapObject = targetMap.get(target);

  if (!targetMapObject) return;
  if (key !== undefined) {
    let keyDepMap = targetMapObject.get(key);
    for (const effect of keyDepMap) {
      if (effect !== activeEffect) {
        effect.run();
      }
    }
  }
};

export const effect = function (fn: Function) {
  const _effect = new ReactiveEffect(fn);
  _effect.run();
  return _effect.run.bind(_effect);
};
