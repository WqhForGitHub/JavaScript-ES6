class Sorter {
  sort(arr: number[], type: string) {
    if (type === 'bubble') {
      // 冒泡排序
      for (let i = 0; i < arr.length; i++)
        for (let j = 0; j < arr.length - 1 - i; j++)
          if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
    } else if (type === 'quick') {
      // 快排
      const quickSort = (a: number[]): number[] =>
        a.length <= 1 ? a : [
          ...quickSort(a.filter(x => x < a[0])),
          a[0],
          ...quickSort(a.filter(x => x > a[0]))
        ];
      return quickSort(arr);
    }
    return arr;
  }
}

export { }