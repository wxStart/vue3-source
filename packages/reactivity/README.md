### 响应式原理说明

### reactive 和 effect

1.创建了 Proxy 对象，里面有 get 和 set 函数  
2.effect 会默认执行一次，此时会访问到 Proxy 对象，触发 get 方法，此时会进行依赖收集，触发 track 函数，创建 WeakMap 对象 targetMap
targetMap 的结构如下`{对象: {key:[effect1,effect2]} }`;  
3.改变 Proxy 对象中的值，会触发 set 函数，set 函数会触发 trigger 函数，此时会根据，修改的对象和属性找到依赖的 effect 数组（Set 结构），然后执行 effect.run 方法，此时就会执行 effect
传入的函数。

### computed

1.计算属性是一个 effect 对象，get 方法会作为 effect 对象的参数     
2.取计算时候就会执行 get 方法，多次取值会根据 dirty 结果进行缓存返回     
3.计算属性依赖的值变化会进行自定的 effect 的 fn 的函数执行，会把 dirty 变为 ture，同时会触发收集的依赖执行(effect 中以来了计算属性)，此时又会执行 计算属性的 get 方法    
