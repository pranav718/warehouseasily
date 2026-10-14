export class PriorityQueue<T> {
  private heap: T[] = [];
  private comparator: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this.comparator = comparator;
  }

  public size(): number {
    return this.heap.length;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public peek(): T | undefined {
    return this.heap[0];
  }

  public push(value: T): void {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  public pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0 && bottom !== undefined) {
      this.heap[0] = bottom;
      this.sinkDown(0);
    }
    return top;
  }

  public clear(): void {
    this.heap = [];
  }

  public toArray(): T[] {
    return [...this.heap];
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.comparator(this.heap[index], this.heap[parentIndex]) < 0) {
        const temp = this.heap[index];
        this.heap[index] = this.heap[parentIndex];
        this.heap[parentIndex] = temp;
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  private sinkDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let smallestIndex = index;

      if (
        leftChildIndex < length &&
        this.comparator(this.heap[leftChildIndex], this.heap[smallestIndex]) < 0
      ) {
        smallestIndex = leftChildIndex;
      }

      if (
        rightChildIndex < length &&
        this.comparator(this.heap[rightChildIndex], this.heap[smallestIndex]) < 0
      ) {
        smallestIndex = rightChildIndex;
      }

      if (smallestIndex !== index) {
        const temp = this.heap[index];
        this.heap[index] = this.heap[smallestIndex];
        this.heap[smallestIndex] = temp;
        index = smallestIndex;
      } else {
        break;
      }
    }
  }
}
