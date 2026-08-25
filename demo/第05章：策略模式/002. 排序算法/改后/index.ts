interface SortStrategy {
  sort(arr: number[]): number[];
}

class BubbleSort implements SortStrategy {
  sort(arr: number[]): number[] {
    const a = [...arr];
    for (let i = 0; i < a.length; i++)
      for (let j = 0; j < a.length - 1 - i; j++)
        if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
    return a;
  }
}

class QuickSort implements SortStrategy {
  sort(arr: number[]): number[] {
    if (arr.length <= 1) return arr;
    const pivot = arr[0];
    return [
      ...this.sort(arr.filter(x => x < pivot)),
      pivot,
      ...this.sort(arr.filter(x => x > pivot))
    ];
  }
}

class Sorter {
  constructor(private strategy: SortStrategy) { }
  setStrategy(s: SortStrategy) { this.strategy = s; }
  sort(arr: number[]) { return this.strategy.sort(arr); }
}

const sorter = new Sorter(new BubbleSort());
console.log(sorter.sort([3, 1, 4, 1, 5]));
sorter.setStrategy(new QuickSort());
console.log(sorter.sort([3, 1, 4, 1, 5]));