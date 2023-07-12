// 需要将dom操作的api和属性api 传给runtime-core
// runtime-core 不需要依赖平台

//

import { nodeOpts } from "./nodeOps";
import { patchProp } from "./patchProps";
import { createRenderer } from "@vue/runtime-core";

const renderOptios = Object.assign(nodeOpts, {
  patchProp,
});

// function createRenderer(renderOptios: object) {
//   return {
//     createApp(component: object, rootProps: object | null) {
//       const app = {
//         mount(container: any) {
//           /**
//                     就可以拿到   runtime-core 就完全和平台无关了
//                     * renderOptios 渲染的方法
//                     * component 渲染的东西
//                     * rootProps 渲染的参数
//                     * container 渲染的容器
//                     */
//           console.log("renderOptios: ", renderOptios);
//           console.log("component: ", component);
//           console.log("container: ", container);
//           console.log("rootProps: ", rootProps);
//         },
//         use() {},
//       };
//       return app;
//     },
//   };
// }

export const createApp = (component: object, rootProps = null) => {
  const { createApp } = createRenderer(renderOptios);
  let app = createApp(component, rootProps);
  let { mount } = app;
  app.mount = function (container: string) {
    let el = document.querySelector(container);
    el!.innerHTML = "";
    mount(el);
  };
  return app;
};

export * from "@vue/runtime-core";
