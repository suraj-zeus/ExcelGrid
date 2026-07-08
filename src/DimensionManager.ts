



export class DimensionManager {

    private count : number;  // total no. of rows or columns
    private sizes : number[];

  constructor(count : number, defaultSize : number) {
    this.count = count;
    this.sizes = new Array(count).fill(defaultSize);
  }


  public getCount() : number {
    return this.count;
  }

  // get the row size or column size 
  public getSize(index : number) : number { 
    return this.sizes[index]!; 
  }

  // set new size (for dynamic sizing)
  public setSize(index : number, newSize : number) {
    // ensure min size = 15 
    this.sizes[index] = Math.max(15, newSize); 
  }

  // offset : sum of all cell size having index less than current index
  public getOffset(index : number) : number {
    let total = 0;
    for (let i = 0; i < index; i++) {
      total += this.sizes[i]!;
    }
    return total;
  }

  // get total size or (total offset)
  public getTotalSize() : number{
    let totalSize : number = 0;
    for(let i=0; i < this.count; i++) {
      totalSize += this.sizes[i]!;
    }

    return totalSize;
  }

  // get the index of row/column for given pixel position
  public getIndexAtOffset(pixelPosition : number) : number {
    let total = 0;
    for (let i = 0; i < this.count; i++) {
      total += this.sizes[i]!;
      if (pixelPosition < total) return i;
    }
    return this.count - 1;
  }
}