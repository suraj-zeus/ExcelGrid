import { HEADER_H, ROWHDR_W } from "./constants.js";
import type { Grid } from "./Grid.js";
import type { IMouseState } from "./Interfaces/IMouseState.js";
import { CellSelectionMouseState } from "./MouseStates/CellSelectionMouseState.js";



export class MouseEventHandler {


    // is mouse being dragged after selecting a cell (header or body cell)
    private isDragging: boolean;
    private currentMouseState : IMouseState;

    constructor(public grid: Grid) {
        this.isDragging = false;

        this.currentMouseState = new CellSelectionMouseState(this.grid);
    }


    public changeState(newState : IMouseState) {
        this.currentMouseState = newState;
    }


    public setIsDragging(isDragging : boolean) {
        this.isDragging = isDragging;
    }

    public getIsDragging() : boolean {
        return this.isDragging;
    }



    // get row number at y
    public getRowAtY(y: number): number {
        return this.grid.getRowManager().getIndexAtOffset(
            Math.max(0, y - HEADER_H + this.grid.getScrollY()),
        );
    }

    // get column number at x
    public getColAtX(x: number) {
        return this.grid.getColManager().getIndexAtOffset(
            Math.max(0, x - ROWHDR_W + this.grid.getScrollX()),
        );
    }


    public bindEvents(): void {
         // mouse down -> start selection (cell, row, column, or range)
        this.grid.getCanvas().addEventListener("pointerdown", (e) => this.currentMouseState.mouseDown(e, this));

        // mouse move -> extend range selection while dragging
        this.grid.getCanvas().addEventListener("pointermove", (e) => this.currentMouseState.mouseMove(e, this));

        // mouse up -> stop dragging
        window.addEventListener("pointerup", (e) => this.currentMouseState.mouseUp(e, this));

        // double click -> start editing the cell
        this.grid.getCanvas().addEventListener("dblclick", (e) => this.currentMouseState.DbClick(e, this));


        // undo/ redo handlers
        this.grid.getUndoButton().addEventListener("click", () => {
            this.grid.getUndoRedoManager().undo();
        });

        this.grid.getRedoButton().addEventListener("click", () => {
            this.grid.getUndoRedoManager().redo();
        });
    }



}