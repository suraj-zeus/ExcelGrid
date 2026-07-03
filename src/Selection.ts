import type { BoundType } from "./types.js";



export class Selection {

  private startRow: number;
  private startCol: number;
  private endRow: number;
  private endCol: number;

  constructor() {
    this.startRow = 0; this.startCol = 0;
    this.endRow = 0; this.endCol = 0;
  }

  public selectCell(row: number, col: number): void {
    this.startRow = this.endRow = row;
    this.startCol = this.endCol = col;
  }

  public extendTo(row: number, col: number): void {
    this.endRow = row;
    this.endCol = col;
  }

  public selectRow(row: number, totalCols: number): void {
    this.startRow = this.endRow = row;
    this.startCol = 0; this.endCol = totalCols - 1;
  }

  public selectColumn(col: number, totalRows: number): void {
    this.startCol = this.endCol = col;
    this.startRow = 0; this.endRow = totalRows - 1;
  }

  public getBounds(): BoundType {
    return {
      top: Math.min(this.startRow, this.endRow),
      bottom: Math.max(this.startRow, this.endRow),
      left: Math.min(this.startCol, this.endCol),
      right: Math.max(this.startCol, this.endCol)
    };
  }


  public isCellSelected(row: number, col: number): boolean {
    const bound: BoundType = this.getBounds();

    return (
      row >= bound.top
      && row <= bound.bottom
      && col >= bound.left
      && col <= bound.right
    );
  }
}