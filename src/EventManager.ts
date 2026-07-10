import type { CellEditor } from "./CellEditor.js";
import { HEADER_H, ROWHDR_W } from "./constants.js";
import type { DimensionManager } from "./DimensionManager.js";
import type { FormulaEngine } from "./FormulaEngine.js";
import type { ResizeManager } from "./ResizeManager.js";
import type { Selection } from "./Selection.js";
import type { BoundType, EditingCellTypeOrNull } from "./types.js";
import type { UndoRedoManager } from "./UndoRedoManager.js";

export class EventManager {
  // is mouse being dragged after selecting a cell (header or body cell)
  private isDragging: boolean;

  constructor(
    private canvas: HTMLCanvasElement,
    private scrollBox: HTMLDivElement,
    private editorInput: HTMLInputElement,
    private undoBtn: HTMLButtonElement,
    private redoBtn: HTMLButtonElement,
    private cellEditor: CellEditor,
    private resizeManager: ResizeManager,
    private selection: Selection,
    private undoRedoManager: UndoRedoManager,
    private rowManager: DimensionManager,
    private colManager: DimensionManager,
    private getScrollX: () => number,
    private getScrollY: () => number,
    private setScroll: (x: number, y: number) => void,
    private resizeCanvas: () => void,
    private render: () => void,
  ) {
    this.isDragging = false;
  }

  // get row number at y
  private getRowAtY(y: number): number {
    return this.rowManager.getIndexAtOffset(
      Math.max(0, y - HEADER_H + this.getScrollY()),
    );
  }

  // get column number at x
  private getColAtX(x: number) {
    return this.colManager.getIndexAtOffset(
      Math.max(0, x - ROWHDR_W + this.getScrollX()),
    );
  }

  public bindEvents(): void {
    // scrolling
    this.scrollBox.addEventListener("scroll", () => {
      this.setScroll(this.scrollBox.scrollLeft, this.scrollBox.scrollTop);
      this.render();
    });

    // window resize
    window.addEventListener("resize", () => {
      this.resizeCanvas();
      this.render();
    });

    // mouse down -> start selection (cell, row, column, or range)
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));

    // mouse move -> extend range selection while dragging
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));

    // mouse up -> stop dragging
    window.addEventListener("mouseup", (e) => this.handleMouseUp(e));

    // double click -> start editing the cell
    this.canvas.addEventListener("dblclick", (e) => this.handleDoubleClick(e));

    // editor input box events -> handle finish and cancel editing
    this.editorInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.cellEditor.finishEditing();
      if (e.key === "Escape") this.cellEditor.cancelEditing();
    });

    this.editorInput.addEventListener("blur", () => this.cellEditor.finishEditing());

    // undo / redo events
    window.addEventListener("keydown", (e) => {

      const arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === "z" && !e.shiftKey) {
          e.preventDefault();
          this.undoRedoManager.undo();
        } else if (e.key.toLowerCase() === "y" && !e.shiftKey) {
          this.undoRedoManager.redo();
        }
      }
      else if (arrowKeys.includes(e.key)) {
        this.handleArrowKeyEventForSelection(e);
      }
    });

    this.undoBtn.addEventListener("click", () => {
      this.undoRedoManager.undo();
    });

    this.redoBtn.addEventListener("click", () => {
      this.undoRedoManager.redo();
    });

  }



  private handleArrowKeyEventForSelection(e: any): void {
    const bounds: BoundType = this.selection.getBounds();
    const tr = bounds.top, tc = bounds.left;

    const editingCell: EditingCellTypeOrNull = this.cellEditor.getEditingCell();
    this.selection.selectCell(tr, tc);

    if (editingCell && tr === editingCell.row && tc === editingCell.col) {
      return; // restrict selection movement while editing cell
    }


    e.preventDefault();
    switch (e.key) {
      case 'ArrowUp':
        this.selectNewCell(Math.max(0, tr - 1), tc);
        break;
      case 'ArrowDown':
        this.selectNewCell(Math.min(this.rowManager.getCount() - 1, tr + 1), tc);
        break;
      case 'ArrowLeft':
        this.selectNewCell(tr, Math.max(0, tc - 1));
        break;
      case 'ArrowRight':
        this.selectNewCell(tr, Math.min(this.colManager.getCount() - 1, tc + 1));
        break;
    }

    this.updateScroll();
    this.render();
  }

  private selectNewCell(ntr: number, ntc: number): void {
    this.selection.selectCell(ntr, ntc);
  }


  private updateScroll() {
    const bounds: BoundType = this.selection.getBounds();
    const tr = bounds.top, tc = bounds.left;

    const cellTopOffset = this.rowManager.getOffset(tr);
    const cellLeftOffset = this.colManager.getOffset(tc);
    const cellRightOffset = this.colManager.getOffset(tc + 1);
    const cellBottomOffset = this.rowManager.getOffset(tr + 1);


    // visible range
    const visLeft = this.getScrollX();
    const visRight = visLeft + this.canvas.width - ROWHDR_W;

    const visTop = this.getScrollY();
    const visBottom = visTop + this.canvas.height - HEADER_H;

    // update horizontal scroll area
    if (cellRightOffset > visRight) {
      this.setScroll(visLeft + (cellRightOffset - visRight), this.getScrollY());
    }
    else if (cellLeftOffset < visLeft) {
      this.setScroll(cellLeftOffset, this.getScrollY())
    }

    // update vertical scroll area
    if (cellBottomOffset > visBottom) {
      this.setScroll(this.getScrollX(), visTop + cellBottomOffset - visBottom);
    }
    else if (cellTopOffset < visTop) {
      this.setScroll(this.getScrollX(), cellTopOffset);
    }

  }



  private handleMouseDown(e: MouseEvent): void {
    // coordinates of click
    const x = e.offsetX, y = e.offsetY;

    if (this.resizeManager.handleMouseDown(x, y)) {
      return
    };

    // clicked on column header
    // select all rows in that column
    if (y < HEADER_H && x > ROWHDR_W) {
      const col = this.getColAtX(x);
      this.selection.selectColumn(col, this.rowManager.getCount());
      this.render();
      return;
    }

    // clicked on row header -> select whole row
    if (x < ROWHDR_W && y > HEADER_H) {
      const row = this.getRowAtY(y);
      this.selection.selectRow(row, this.colManager.getCount());
      this.render();
      return;
    }

    // clicked on a normal cell -> start a range selection (single cell if no drag happens)
    if (x > ROWHDR_W && y > HEADER_H) {
      const row = this.getRowAtY(y);
      const col = this.getColAtX(x);
      this.selection.selectCell(row, col);
      this.isDragging = true;
      this.render();
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    // coordinates of moving mouse
    const x = e.offsetX,
      y = e.offsetY;

    if (this.resizeManager.handleMouseMove(x, y)) {
      return;
    }

    // change the cursor type
    if (!this.isDragging) {
      if (this.resizeManager.getColumnBorderIndexAt(x, y) !== null) {
        this.canvas.style.cursor = "col-resize";
      } else if (this.resizeManager.getRowBorderIndexAt(x, y) !== null) {
        this.canvas.style.cursor = "row-resize";
      } else {
        this.canvas.style.cursor = "default";
      }
    }

    // if mouse is not being dragged, then no need to extend the selection range
    // also ignore the header area selection while dragging
    if (!this.isDragging || x < ROWHDR_W || y < HEADER_H) return;

    // otherwise, extend the selection range
    const row = this.getRowAtY(y);
    const col = this.getColAtX(x);
    this.selection.extendTo(row, col);
    this.render();
  }

  private handleMouseUp(e: MouseEvent): void {
    // make dragging false
    this.isDragging = false;

    this.resizeManager.handleMouseUp();
  }

  private handleDoubleClick(e: MouseEvent): void {
    // coordinates of double click
    const x = e.offsetX, y = e.offsetY;
    if (x < ROWHDR_W || y < HEADER_H) return;

    const row = this.getRowAtY(y);
    const col = this.getColAtX(x);

    this.cellEditor.startEditing(row, col);
    this.render();
  }
}
