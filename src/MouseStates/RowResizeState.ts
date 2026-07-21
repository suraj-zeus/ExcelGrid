import { ROWHDR_W } from "../constants.js";
import type { Grid } from "../Grid.js";
import type { IMouseState } from "../Interfaces/IMouseState.js";
import type { MouseEventHandler } from "../MouseEventHandler.js";
import { CellSelectionMouseState } from "./CellSelectionMouseState.js";




export class RowResizeState implements IMouseState {

    private isActive: boolean = false;


    constructor(private grid: Grid) { }


    public mouseDown(e: MouseEvent, mouseEventHandler: MouseEventHandler): boolean {
        // coordinates of click
        const x = e.offsetX, y = e.offsetY;

        if (this.grid.getResizeManager().getRowBorderIndexAt(x, y) == null) return false;

        this.isActive = true;
        this.grid.getResizeManager().resizeRowDown(x, y);

        return true;
    }

    public mouseUp(e: MouseEvent, mouseEventHandler: MouseEventHandler): boolean {
        if (!this.isActive) return false;

        this.grid.getResizeManager().resizeRowUp();
        this.isActive = false;

        return true;
    }


    public mouseMove(e: MouseEvent, mouseEventHandler: MouseEventHandler): boolean {

        if (!this.isActive) return false;

        const x = e.offsetX,
            y = e.offsetY;

        // // restrict the cell resizing when pointer moves out of header 
        //  if(x > ROWHDR_W) 
        //      return false;

        this.grid.getResizeManager().resizeRowMove(x, y);
        return true;
    }

    public DbClick(e: MouseEvent, mouseEventHandler: MouseEventHandler): boolean {
        return false;
    }

    public hover(e: MouseEvent, mouseEventHandler: MouseEventHandler): void {
        const x = e.offsetX, y = e.offsetY;
        if (this.grid.getResizeManager().getRowBorderIndexAt(x, y) != null && x < ROWHDR_W) {
             this.grid.getCanvas().style.cursor = "row-resize";
        }
    }

}