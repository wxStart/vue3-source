import { isObject } from "@vue/shared";
import { isVNode, createVNode } from "./createVNode";

export function h(type: any, propsOrChildren: any, children: any) {
  // 写法1 h1('div',{color:red})
  // 写法2 h1('div',h1('span'))
  // 写法3 h1('div','neirong ')
  //写法4 h1('div',['孩子 ','孩子 ']),
  let l = arguments.length;
  if (l === 2) {
    if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
      //propsOrChildren是孩子元素
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren]); // h1('div',h1('span'))
      }
      // propsOrChildren 是属性
      return createVNode(type, propsOrChildren, null); // h1('div',{color:red})
    } else {
      return createVNode(type, null, propsOrChildren); // h1('div','neirong ')  或者 h1('div',['孩子 ','孩子 ']),
    }
  } else {
    if (l > 3) {
      children = Array.prototype.slice.call(arguments, 2);
    } else if (l === 3 && isVNode(children)) {
      children = [children];
    }

    return createVNode(type, propsOrChildren, children); // 写法5,6,7,8
  }

  // 写法5 h1('div',{},'neirong '),
  // 写法6 h1('div',{},['孩子 ','孩子 ']),
  // 写法7 h1('div',{},h1('span')),
  // 写法8 h1('div',{},h1('span'),h1('span'),h1('span')),
}
