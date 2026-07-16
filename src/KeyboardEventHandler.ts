import { HEADER_H, ROWHDR_W } from "./constants.js";
import type { Grid } from "./Grid.js";
import type { BoundType, EditingCellTypeOrNull } from "./types.js";



export class KeyboardEventHandler {
    constructor(private grid: Grid) {

    }






    private handleArrowKeyEventForSelection(e: any): void {
        const bounds: BoundType = this.grid.getSelection().getBounds();
        const tr = bounds.top, tc = bounds.left;

        const editingCell: EditingCellTypeOrNull = this.grid.getCellEditor().getEditingCell();
        this.grid.getSelection().selectCell(tr, tc);

        if (editingCell && tr === editingCell.row && tc === editingCell.col) {
            return; // restrict selection movement while editing cell
        }


        e.preventDefault();
        switch (e.key) {
            case 'ArrowUp':
                this.selectNewCell(Math.max(0, tr - 1), tc);
                break;
            case 'ArrowDown':
                this.selectNewCell(Math.min(this.grid.getRowManager().getCount() - 1, tr + 1), tc);
                break;
            case 'ArrowLeft':
                this.selectNewCell(tr, Math.max(0, tc - 1));
                break;
            case 'ArrowRight':
                this.selectNewCell(tr, Math.min(this.grid.getColManager().getCount() - 1, tc + 1));
                break;
        }

        this.updateScroll();
        this.grid.render();
    }

    private selectNewCell(ntr: number, ntc: number): void {
        this.grid.getSelection().selectCell(ntr, ntc);
    }


    private updateScroll() {
        const bounds: BoundType = this.grid.getSelection().getBounds();
        const tr = bounds.top, tc = bounds.left;

        const cellTopOffset = this.grid.getRowManager().getOffset(tr);
        const cellLeftOffset = this.grid.getColManager().getOffset(tc);
        const cellRightOffset = this.grid.getColManager().getOffset(tc + 1);
        const cellBottomOffset = this.grid.getRowManager().getOffset(tr + 1);


        // visible range
        const visLeft = this.grid.getScrollX();
        const visRight = visLeft + this.grid.getCanvas().width - ROWHDR_W;

        const visTop = this.grid.getScrollY();
        const visBottom = visTop + this.grid.getCanvas().height - HEADER_H;

        // update horizontal scroll area
        if (cellRightOffset > visRight) {
            this.grid.setScroll(visLeft + (cellRightOffset - visRight), this.grid.getScrollY());
        }
        else if (cellLeftOffset < visLeft) {
            this.grid.setScroll(cellLeftOffset, this.grid.getScrollY())
        }

        // update vertical scroll area
        if (cellBottomOffset > visBottom) {
            this.grid.setScroll(this.grid.getScrollX(), visTop + cellBottomOffset - visBottom);
        }
        else if (cellTopOffset < visTop) {
            this.grid.setScroll(this.grid.getScrollX(), cellTopOffset);
        }

    }


    public handleKeydownEventForFinishAndCancel(e: any) : void {

        if (e.key === "Enter") this.grid.getCellEditor().finishEditing();
        if (e.key === "Escape") this.grid.getCellEditor().cancelEditing();

    }

    public handleKeydownForUndoRedo(e : any) : void {

      const arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === "z" && !e.shiftKey) {
          e.preventDefault();
          this.grid.getUndoRedoManager().undo();
        } else if (e.key.toLowerCase() === "y" && !e.shiftKey) {
          this.grid.getUndoRedoManager().redo();
        }
      }
      else if (arrowKeys.includes(e.key)) {
        this.handleArrowKeyEventForSelection(e);
      }
    }


    public bindEvents() {
        
    // editor input box events -> handle finish and cancel editing
    this.grid.getEditorInput().addEventListener("keydown", (e) => this.handleKeydownEventForFinishAndCancel(e));

    this.grid.getEditorInput().addEventListener("blur", () => this.grid.getCellEditor().finishEditing());

    // undo / redo events
    window.addEventListener("keydown", (e) => this.handleKeydownForUndoRedo(e));

    
    }


}