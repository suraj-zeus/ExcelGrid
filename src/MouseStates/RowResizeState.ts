import type { Grid } from "../Grid.js";
import type { IMouseState } from "../Interfaces/IMouseState.js";
import type { MouseEventHandler } from "../MouseEventHandler.js";
import { CellSelectionMouseState } from "./CellSelectionMouseState.js";




export class RowResizeState implements IMouseState {

    constructor(private grid : Grid) {}


    mouseDown(e: MouseEvent, mouseEventHandler: MouseEventHandler): void {
         // coordinates of click
        const x = e.offsetX, y = e.offsetY;

        mouseEventHandler.setIsDragging(true);
        this.grid.getResizeManager().resizeRowDown(x, y);
    }

    mouseUp(e: MouseEvent, mouseEventHandler: MouseEventHandler): void {
         mouseEventHandler.setIsDragging(false);
          this.grid.getResizeManager().resizeRowUp();
                mouseEventHandler.changeState(new CellSelectionMouseState(this.grid));
    }


    mouseMove(e: MouseEvent, mouseEventHandler: MouseEventHandler): void {
         const x = e.offsetX,
            y = e.offsetY;

        this.grid.getResizeManager().resizeRowMove(x, y);
    }

    DbClick(e: MouseEvent, mouseEventHandler: MouseEventHandler): void {
    }
    
}