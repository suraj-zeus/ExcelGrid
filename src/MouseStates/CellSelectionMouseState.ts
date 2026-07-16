import { HEADER_H, ROWHDR_W } from "../constants.js";
import type { Grid } from "../Grid.js";
import type { IMouseState } from "../Interfaces/IMouseState.js";
import type { MouseEventHandler } from "../MouseEventHandler.js";
import { ColResizeState } from "./ColResizeState.js";
import { ColSelectionState } from "./ColSelectionState.js";
import { RowResizeState } from "./RowResizeState.js";
import { RowSelectionState } from "./RowSelectionState.js";



export class CellSelectionMouseState implements IMouseState {

    constructor(private grid: Grid) {

    }

    mouseDown(e: MouseEvent, mouseEventHandler: MouseEventHandler): void {

        // coordinates of click
        const x = e.offsetX, y = e.offsetY;

        if (this.grid.getResizeManager().getColumnBorderIndexAt(x, y) != null) {
            const nextState = new ColResizeState(this.grid);

            mouseEventHandler.changeState(nextState);

            nextState.mouseDown(e, mouseEventHandler);
            return;
        };


        if (this.grid.getResizeManager().getRowBorderIndexAt(x, y) != null) {

            const nextState = new RowResizeState(this.grid);
            mouseEventHandler.changeState(nextState);

            nextState.mouseDown(e, mouseEventHandler);
            return;
        };

       
        const row = mouseEventHandler.getRowAtY(y);
        const col = mouseEventHandler.getColAtX(x);

        // clicked on column header
        // select all rows in that column
        if (y < HEADER_H && x > ROWHDR_W) {
            const nextState = new ColSelectionState(this.grid);
            mouseEventHandler.changeState(nextState);
            nextState.mouseDown(e, mouseEventHandler);
            return;
        }

        // clicked on row header -> select whole row
        if (x < ROWHDR_W && y > HEADER_H) {
            const nextState = new RowSelectionState(this.grid);
           mouseEventHandler.changeState(nextState);
           nextState.mouseDown(e, mouseEventHandler);
            return;
        }

        // clicked on a normal cell -> start a range selection (single cell if no drag happens)
        if (x > ROWHDR_W && y > HEADER_H) {
            this.grid.getSelection().selectCell(row, col);
            mouseEventHandler.setIsDragging(true);
            this.grid.render();
        }
    }

    mouseUp(e: MouseEvent, mouseEventHandler: MouseEventHandler): void {

        mouseEventHandler.setIsDragging(false);
    }

    mouseMove(e: MouseEvent, mouseEventHandler: MouseEventHandler): void {

        // coordinates of moving mouse
        const x = e.offsetX,
            y = e.offsetY;

         // if mouse is not being dragged, then no need to extend the selection range
        // also ignore the header area selection while dragging
        if (!mouseEventHandler.getIsDragging() || x < ROWHDR_W || y < HEADER_H) return;

        // otherwise, extend the selection range
        const row = mouseEventHandler.getRowAtY(y);
        const col = mouseEventHandler.getColAtX(x);
        this.grid.getSelection().extendTo(row, col);
        this.grid.render();


    }


    DbClick(e: MouseEvent, mouseEventHandler: MouseEventHandler): void {
         // coordinates of double click
        const x = e.offsetX, y = e.offsetY;
        if (x < ROWHDR_W || y < HEADER_H) return;

        const row = mouseEventHandler.getRowAtY(y);
        const col = mouseEventHandler.getColAtX(x);

        this.grid.getCellEditor().startEditing(row, col);
        this.grid.render();
    }

}