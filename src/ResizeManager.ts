import type { Command } from "./Command.js";
import {
  DEFAULT_COL_WIDTH,
  DEFAULT_ROW_HEIGHT,
  HEADER_H,
  RESIZE_HANDLE_SIZE,
  ROWHDR_W,
} from "./constants.js";
import type { DimensionManager } from "./DimensionManager.js";
import type { Grid } from "./Grid.js";
import { ResizeCommand } from "./ResizeCommand.js";
import type { UndoRedoManager } from "./UndoRedoManager.js";

export class ResizeManager {


  // for resizing the grid,
  private resizingColInd: number | null; // index of column being resized, null if not resizing
  private resizingRowInd: number | null; // index of row being resized, null if not resizing
  private resizingStartX: number; // starting x position of mouse when resizing started
  private resizingStartY: number; // starting y position of mouse when resizing started
  private resizeStartSize: number; // starting size of row/column (before resizing started)

  constructor(
    private grid: Grid,
  ) {

    // initial values for resizing
    this.resizingColInd = null;
    this.resizingRowInd = null;
    this.resizingStartX = 0;
    this.resizingStartY = 0;
    this.resizeStartSize = 0;
  }

  public isResizing(): boolean {
    return this.resizingColInd !== null || this.resizingRowInd !== null;
  }

  // cell resize helpers

  // get the column border at the given x coordinate (used for resizing columns)
  public getColumnBorderIndexAt(x: number, y: number): number | null {
    if (y > HEADER_H) return null; // not in column header area

    let offset = ROWHDR_W - this.grid.getScrollX();
    for (let col = 0; col < this.grid.getColManager().getCount(); col++) {
      offset += this.grid.getColManager().getSize(col);

      if (Math.abs(x - offset) <= RESIZE_HANDLE_SIZE) {
        return col;
      }

      if (offset > x + RESIZE_HANDLE_SIZE) break;
    }

    return null;
  }

  // get the row border at the given y coordinate (used for resizing rows)
  public getRowBorderIndexAt(x: number, y: number): number | null {
    if (x > ROWHDR_W) return null;

    let offset = HEADER_H - this.grid.getScrollY();
    for (let row = 0; row < this.grid.getRowManager().getCount(); row++) {
      offset += this.grid.getRowManager().getSize(row);

      if (Math.abs(y - offset) <= RESIZE_HANDLE_SIZE) {
        return row;
      }

      if (offset > y + RESIZE_HANDLE_SIZE) break;
    }

    return null;
  }


  public resizeRowDown(x: number, y: number): void {
    const rowBorderInd = this.getRowBorderIndexAt(x, y);
    if (rowBorderInd !== null) {
      this.resizingRowInd = rowBorderInd;
      this.resizingStartY = y;
      this.resizeStartSize = this.grid.getRowManager().getSize(rowBorderInd);
      this.grid.render();
    }

    this.grid.render();
  }


  public resizeColDown(x: number, y: number) {
    const colBorderInd = this.getColumnBorderIndexAt(x, y);
    if (colBorderInd !== null) {
      this.resizingColInd = colBorderInd;
      this.resizingStartX = x;
      this.resizeStartSize = this.grid.getColManager().getSize(colBorderInd);
      this.grid.render();
    }
  }


  public resizeRowMove(x: number, y: number) {
    if (this.resizingRowInd !== null) {
      const newSize = Math.max(
        DEFAULT_ROW_HEIGHT,
        this.resizeStartSize + (y - this.resizingStartY),
      );
      this.grid.getRowManager().setSize(this.resizingRowInd, newSize);
      this.grid.setupSpacer();
      this.grid.render();
    }
  }


  public resizeColMove(x: number, y: number) {
    if (this.resizingColInd !== null) {
      const newSize = Math.max(
        DEFAULT_COL_WIDTH,
        this.resizeStartSize + (x - this.resizingStartX),
      );
      this.grid.getColManager().setSize(this.resizingColInd, newSize);
      this.grid.setupSpacer();
      this.grid.render();
    }
  }

  public resizeRowUp() {
    if (this.resizingRowInd !== null) {
      const resizingRowInd = this.resizingRowInd;
      const oldResizingSize = this.resizeStartSize;
      const newResizingSize = this.grid.getRowManager().getSize(resizingRowInd);

      if (oldResizingSize !== newResizingSize) {
        const command: Command = new ResizeCommand(
          this.grid.getRowManager(),
          resizingRowInd,
          oldResizingSize,
          newResizingSize,
          () => this.grid.setupSpacer(),
          () => this.grid.render(),
        );

        this.grid.getUndoRedoManager().pushCommand(command);
      }

      this.resizingRowInd = null;
      this.grid.render();
    }
  }

  public resizeColUp() {

    // stop resizing if any
    if (this.resizingColInd !== null) {
      const resizingColInd = this.resizingColInd;
      const oldResizingSize = this.resizeStartSize;
      const newResizingSize = this.grid.getColManager().getSize(resizingColInd);

      if (oldResizingSize !== newResizingSize) {
        const command: Command = new ResizeCommand(
          this.grid.getColManager(),
          resizingColInd,
          oldResizingSize,
          newResizingSize,
          () => this.grid.setupSpacer(),
          () => this.grid.render(),
        );

        this.grid.getUndoRedoManager().pushCommand(command);
      }

      this.resizingColInd = null;
      this.grid.render();
    }

  }
}
