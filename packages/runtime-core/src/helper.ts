export function getSequence(array:any) {
    let len = array.length;
    let p = array.slice(0); //表示
    const result = [0];
    let lastIndex;
    let start, end, middle;
    for (let index = 0; index < len; index++) {
      const element = array[index];
      if (element !== 0) {
        lastIndex = result[result.length - 1];
        if (element > array[lastIndex]) {
          // 记录当前起一个人的下标
          p[index] = lastIndex;
          result.push(index);
          continue;
        }
        // 二分查找进行替换

        start = 0;
        end = result.length - 1;

        while (start < end) {
          // 相等的时候才会结束
          middle = ((start + end) / 2) | 0;
          if (array[result[middle]] < element) {
            //当前值比中间值大 找后面一半
            start = middle + 1;
          } else {
            end = middle;
          }
        }
        if (element < array[result[start]]) {
          // 替换   记录当前的前一个下标
          p[index] = result[start - 1];
          result[start] = index;
        }
      }
    }

    let i = result.length;
    let last = result[i - 1];
    while (i-- > 0) {
      result[i] = last;
      // 找到前一个记录的下标  在p里面  p里面记录了 当前的真实前一个下标
      last = p[last];
    }
    return result;
  }