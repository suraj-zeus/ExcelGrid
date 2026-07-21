import { HEADER_H } from "../constants.js";
import type { Grid } from "../Grid.js";
import type { IMouseState } from "../Interfaces/IMouseState.js";
import type { MouseEventHandler } from "../MouseEventHandler.js";
import { CellSelectionMouseState } from "./CellSelectionMouseState.js";


export class ColResizeState implements IMouseState {
    private isActive: boolean = false;

    constructor(private grid: Grid) { }

    public mouseDown(e: MouseEvent, mouseEventHandler: MouseEventHandler): boolean {
        // coordinates of click
        const x = e.offsetX, y = e.offsetY;

        if (this.grid.getResizeManager().getColumnBorderIndexAt(x, y) == null)
            return false;

        this.isActive = true;
        this.grid.getResizeManager().resizeColDown(x, y);

        return true;
    }

    public mouseUp(e: MouseEvent, mouseEventHandler: MouseEventHandler): boolean {

        if (!this.isActive)
            return false;

        this.grid.getResizeManager().resizeColUp();
        this.isActive = false;

        return true;
    }

    public mouseMove(e: MouseEvent, mouseEventHandler: MouseEventHandler): boolean {

        if (!this.isActive) return false;

        const x = e.offsetX, y = e.offsetY;

        // // restrict the cell resizing when pointer moves out of header 
        //  if(y > HEADER_H) 
        //      return false;

        this.grid.getResizeManager().resizeColMove(x, y);

        return true;
    }

    public DbClick(e: MouseEvent, mouseEventHandler: MouseEventHandler): boolean {
        return false;
    }


    public hover(e: MouseEvent, mouseEventHandler: MouseEventHandler): void {
        const x = e.offsetX, y = e.offsetY;
        if (this.grid.getResizeManager().getColumnBorderIndexAt(x, y)  != null && y < HEADER_H) {
            this.grid.getCanvas().style.cursor = "col-resize";
        }
    }

}