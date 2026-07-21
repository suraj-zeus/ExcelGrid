import { HEADER_H, ROWHDR_W } from "../constants.js";
import type { Grid } from "../Grid.js";
import type { IMouseState } from "../Interfaces/IMouseState.js";
import type { MouseEventHandler } from "../MouseEventHandler.js";



export class RowSelectionState implements IMouseState {

    private isActive: boolean = false;

    constructor(private grid: Grid) { }

    public mouseDown(e: MouseEvent, mouseEventHandler: MouseEventHandler): boolean {

        // coordinates of click
        const x = e.offsetX, y = e.offsetY;


        // clicked on row header -> select whole row
        if (x < ROWHDR_W && y > HEADER_H) {
            this.isActive = true;

            const row = mouseEventHandler.getRowAtY(y);
            this.grid.getSelection().selectRow(row, this.grid.getColManager().getCount());
            this.grid.render();
            return true;
        }

        return false;
    }

    public mouseUp(e: MouseEvent, mouseEventHandler: MouseEventHandler): boolean {

        if (!this.isActive) return false;

        this.isActive = false;
        return true;
    }

    public mouseMove(e: MouseEvent, mouseEventHandler: MouseEventHandler): boolean {
         if(!this.isActive) return false;
        
        const x = e.offsetX, y = e.offsetY;

        if(x > ROWHDR_W) return false;

        const row = mouseEventHandler.getRowAtY(y);
        const lastColIndex = this.grid.getColManager().getCount() - 1;

        this.grid.getSelection().extendTo(row, lastColIndex);
        this.grid.render();

        return true;
    }

    public DbClick(e: MouseEvent, mouseEventHandler: MouseEventHandler): boolean {
        return false;
    }

}