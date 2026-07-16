import { HEADER_H, ROWHDR_W } from "../constants.js";
import type { Grid } from "../Grid.js";
import type { IMouseState } from "../Interfaces/IMouseState.js";
import type { MouseEventHandler } from "../MouseEventHandler.js";
import { CellSelectionMouseState } from "./CellSelectionMouseState.js";



export class ColSelectionState implements IMouseState {

    constructor(private grid: Grid) { }


    mouseDown(e: MouseEvent, mouseEventHandler: MouseEventHandler): void {
        // clicked on column header
        // coordinates of click
        const x = e.offsetX, y = e.offsetY;

        // select all rows in that column
        if (y < HEADER_H && x > ROWHDR_W) {
            mouseEventHandler.setIsDragging(true);
            const col = mouseEventHandler.getColAtX(x);
            this.grid.getSelection().selectColumn(col, this.grid.getRowManager().getCount());
            this.grid.render();
            return;
        }
    }

    mouseUp(e: MouseEvent, mouseEventHandler: MouseEventHandler): void {
        mouseEventHandler.setIsDragging(false);
        mouseEventHandler.changeState(new CellSelectionMouseState(this.grid));
    }

    mouseMove(e: MouseEvent, mouseEventHandler: MouseEventHandler): void {
        const x = e.offsetX, y = e.offsetY;
        // IF NOT DRAGGING: Update cursors dynamically on hover
        if (!mouseEventHandler.getIsDragging()) {
            if (this.grid.getResizeManager().getColumnBorderIndexAt(x, y) !== null) {
                this.grid.getCanvas().style.cursor = "col-resize";
            } else if (this.grid.getResizeManager().getRowBorderIndexAt(x, y) !== null) {
                this.grid.getCanvas().style.cursor = "row-resize";
            } else {
                this.grid.getCanvas().style.cursor = "default";
            }
        }
    }

    DbClick(e: MouseEvent, mouseEventHandler: MouseEventHandler): void {

    }

}