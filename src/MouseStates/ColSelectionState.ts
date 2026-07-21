import { HEADER_H, ROWHDR_W } from "../constants.js";
import type { Grid } from "../Grid.js";
import type { IMouseState } from "../Interfaces/IMouseState.js";
import type { MouseEventHandler } from "../MouseEventHandler.js";
import { CellSelectionMouseState } from "./CellSelectionMouseState.js";



export class ColSelectionState implements IMouseState {

    private isActive = false;

    constructor(private grid: Grid) { }


    public mouseDown(e: MouseEvent, mouseEventHandler: MouseEventHandler): boolean {
        // coordinates of click
        const x = e.offsetX, y = e.offsetY;

        // clicked on column header
        // select all rows in that column
        if (y < HEADER_H && x > ROWHDR_W) {

            this.isActive = true;

            const col = mouseEventHandler.getColAtX(x);
            this.grid.getSelection().selectColumn(col, this.grid.getRowManager().getCount());
            this.grid.render();
            return true;
        }

        return false;
    }

    public mouseUp(e: MouseEvent, mouseEventHandler: MouseEventHandler): boolean {
        if(!this.isActive) return false;

        this.isActive = false;
        return true;
    }

    public  mouseMove(e: MouseEvent, mouseEventHandler: MouseEventHandler): boolean {
        if(!this.isActive) return false;
        
        const x = e.offsetX, y = e.offsetY;

        if(y > HEADER_H) return false;

        const col = mouseEventHandler.getColAtX(x);
        const lastRowIndex = this.grid.getRowManager().getCount() - 1;

        this.grid.getSelection().extendTo(lastRowIndex, col);
        this.grid.render();

        return true;
    }

    public  DbClick(e: MouseEvent, mouseEventHandler: MouseEventHandler): boolean {
        return false;
    }

}