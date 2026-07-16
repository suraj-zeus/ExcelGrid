import { HEADER_H, ROWHDR_W } from "../constants.js";
import type { Grid } from "../Grid.js";
import type { IMouseState } from "../Interfaces/IMouseState.js";
import type { MouseEventHandler } from "../MouseEventHandler.js";
import { CellSelectionMouseState } from "./CellSelectionMouseState.js";



export class RowSelectionState implements IMouseState {



    constructor(private grid : Grid) {}

    mouseDown(e: MouseEvent, mouseEventHandler: MouseEventHandler): void {

         // coordinates of click
        const x = e.offsetX, y = e.offsetY;

        // clicked on row header -> select whole row
        if (x < ROWHDR_W && y > HEADER_H) {
             mouseEventHandler.setIsDragging(true);
            const row = mouseEventHandler.getRowAtY(y);
            this.grid.getSelection().selectRow(row, this.grid.getColManager().getCount());
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