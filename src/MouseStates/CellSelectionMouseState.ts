import { HEADER_H, ROWHDR_W } from "../constants.js";
import type { Grid } from "../Grid.js";
import type { IMouseState } from "../Interfaces/IMouseState.js";
import type { MouseEventHandler } from "../MouseEventHandler.js";



export class CellSelectionMouseState implements IMouseState {

    private isDragging = false;
    private isActive: boolean = false;

    constructor(private grid: Grid) {

    }

    public mouseDown(e: MouseEvent, mouseEventHandler: MouseEventHandler): boolean {
        // coordinates of click
        const x = e.offsetX, y = e.offsetY;
        const row = mouseEventHandler.getRowAtY(y);
        const col = mouseEventHandler.getColAtX(x);

        // clicked on a normal cell -> start a range selection (single cell if no drag happens)
        if (x > ROWHDR_W && y > HEADER_H) {
            this.isActive = true;

            this.isDragging = true;
            this.grid.getSelection().selectCell(row, col);
            this.grid.render();

            return true;
        }

        return false;
    }

    public mouseUp(e: MouseEvent, mouseEventHandler: MouseEventHandler): boolean {
        if (!this.isActive) return false;

        this.isDragging = false;
        return true;
    }

    public mouseMove(e: MouseEvent, mouseEventHandler: MouseEventHandler): boolean {

        if (!this.isActive) return false;

        // coordinates of moving mouse
        const x = e.offsetX, y = e.offsetY;

        // also ignore the header area selection while dragging
        // or, when not dragging
        if (x < ROWHDR_W || y < HEADER_H || !this.isDragging) 
            return false;

        // otherwise, extend the selection range
        const row = mouseEventHandler.getRowAtY(y);
        const col = mouseEventHandler.getColAtX(x);
        this.grid.getSelection().extendTo(row, col);
        this.grid.render();

        return true;
    }


    public DbClick(e: MouseEvent, mouseEventHandler: MouseEventHandler): boolean {
        if (!this.isActive) return false;

        // coordinates of double click
        const x = e.offsetX, y = e.offsetY;
        if (x < ROWHDR_W || y < HEADER_H) return false;

        const row = mouseEventHandler.getRowAtY(y);
        const col = mouseEventHandler.getColAtX(x);

        this.grid.getCellEditor().startEditing(row, col);
        this.grid.render();

        return true;
    }

    public hover(e: MouseEvent, mouseEventHandler: MouseEventHandler): void {
        const x = e.offsetX, y = e.offsetY;

        if (x > ROWHDR_W && y > HEADER_H) {
            this.grid.getCanvas().style.cursor = "cell";
        }
    }

}