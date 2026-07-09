import type { Command } from "./Command.js";
import {
  DEFAULT_COL_WIDTH,
  DEFAULT_ROW_HEIGHT,
  HEADER_H,
  RESIZE_HANDLE_SIZE,
  ROWHDR_W,
} from "./constants.js";
import type { DimensionManager } from "./DimensionManager.js";
import { ResizeCommand } from "./ResizeCommand.js";
import type { UndoRedoManager } from "./UndoRedoManager.js";

export class ResizeManager {
  private rowManager: DimensionManager;
  private colManager: DimensionManager;
  private undoRedoManager: UndoRedoManager;
  private getScrollX: () => number;
  private getScrollY: () => number;
  private setupSpacer: () => void;
  private render: () => void;

  // for resizing the grid,
  private resizingColInd: number | null; // index of column being resized, null if not resizing
  private resizingRowInd: number | null; // index of row being resized, null if not resizing
  private resizingStartX: number; // starting x position of mouse when resizing started
  private resizingStartY: number; // starting y position of mouse when resizing started
  private resizeStartSize: number; // starting size of row/column (before resizing started)

  constructor(
    rowManager: DimensionManager,
    colManager: DimensionManager,
    undoRedoManager: UndoRedoManager,
    getScrollX: () => number,
    getScrollY: () => number,
    setupSpacer: () => void,
    render: () => void,
  ) {
    this.rowManager = rowManager;
    this.colManager = colManager;
    this.undoRedoManager = undoRedoManager;
    this.getScrollX = getScrollX;
    this.getScrollY = getScrollY;
    this.setupSpacer = setupSpacer;
    this.render = render;

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

    let offset = ROWHDR_W - this.getScrollX();
    for (let col = 0; col < this.colManager.getCount(); col++) {
      offset += this.colManager.getSize(col);

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

    let offset = HEADER_H - this.getScrollY();
    for (let row = 0; row < this.rowManager.getCount(); row++) {
      offset += this.rowManager.getSize(row);

      if (Math.abs(y - offset) <= RESIZE_HANDLE_SIZE) {
        return row;
      }

      if (offset > y + RESIZE_HANDLE_SIZE) break;
    }

    return null;
  }

  public handleMouseDown(x: number, y: number): boolean {
    // check if mouse is clicked on a header border area (for resizing)
    const colBorderInd = this.getColumnBorderIndexAt(x, y);
    if (colBorderInd !== null) {
      this.resizingColInd = colBorderInd;
      this.resizingStartX = x;
      this.resizeStartSize = this.colManager.getSize(colBorderInd);
      this.render();
      return true;
    }

    const rowBorderInd = this.getRowBorderIndexAt(x, y);
    if (rowBorderInd !== null) {
      this.resizingRowInd = rowBorderInd;
      this.resizingStartY = y;
      this.resizeStartSize = this.rowManager.getSize(rowBorderInd);
      this.render();
      return true;
    }

    this.render();
    return false;
  }

  public handleMouseMove(x: number, y: number): boolean {
    // while resizing a row/column is in progress
    if (this.resizingColInd !== null) {
      const newSize = Math.max(
        DEFAULT_COL_WIDTH,
        this.resizeStartSize + (x - this.resizingStartX),
      );
      this.colManager.setSize(this.resizingColInd, newSize);
      this.setupSpacer();
      this.render();
      return true;
    }

    if (this.resizingRowInd !== null) {
      const newSize = Math.max(
        DEFAULT_ROW_HEIGHT,
        this.resizeStartSize + (y - this.resizingStartY),
      );
      this.rowManager.setSize(this.resizingRowInd, newSize);
      this.setupSpacer();
      this.render();
      return true;
    }

    this.render(); 
    return false;
  }

  public handleMouseUp(): boolean {

    let handled = false;

     // stop resizing if any
    if (this.resizingColInd !== null) {
      const resizingColInd = this.resizingColInd;
      const oldResizingSize = this.resizeStartSize;
      const newResizingSize = this.colManager.getSize(resizingColInd);

      if (oldResizingSize !== newResizingSize) {
        const command: Command = new ResizeCommand(
          this.colManager,
          resizingColInd,
          oldResizingSize,
          newResizingSize,
          () => this.setupSpacer(),
          () => this.render(),
        );

        this.undoRedoManager.pushCommand(command);
      }

      this.resizingColInd = null;
      handled = true;
    }

    if (this.resizingRowInd !== null) {
      const resizingRowInd = this.resizingRowInd;
      const oldResizingSize = this.resizeStartSize;
      const newResizingSize = this.rowManager.getSize(resizingRowInd);

      if (oldResizingSize !== newResizingSize) {
        const command: Command = new ResizeCommand(
          this.rowManager,
          resizingRowInd,
          oldResizingSize,
          newResizingSize,
          () => this.setupSpacer(),
          () => this.render(),
        );

        this.undoRedoManager.pushCommand(command);
      }

      this.resizingRowInd = null;
      handled = true;
    }

    this.render();
    return handled;
  }
}
