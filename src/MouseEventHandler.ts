import { HEADER_H, ROWHDR_W } from "./constants.js";
import type { Grid } from "./Grid.js";
import type { IMouseState } from "./Interfaces/IMouseState.js";
import { CellSelectionMouseState } from "./MouseStates/CellSelectionMouseState.js";
import { ColResizeState } from "./MouseStates/ColResizeState.js";
import { ColSelectionState } from "./MouseStates/ColSelectionState.js";
import { RowResizeState } from "./MouseStates/RowResizeState.js";
import { RowSelectionState } from "./MouseStates/RowSelectionState.js";



export class MouseEventHandler {


    // is mouse being dragged after selecting a cell (header or body cell)
    private isDragging: boolean;
    private currentMouseState: IMouseState;
    private states: IMouseState[];

    constructor(private grid: Grid) {
        this.isDragging = false;

        this.currentMouseState = new CellSelectionMouseState(this.grid);

        this.states = [
            new ColResizeState(this.grid),
            new RowResizeState(this.grid),
            new ColSelectionState(this.grid),
            new RowSelectionState(this.grid),
            new CellSelectionMouseState(this.grid)
        ]
    }


    public changeState(newState: IMouseState) {
        this.currentMouseState = newState;
    }


    public setIsDragging(isDragging: boolean) {
        this.isDragging = isDragging;
    }

    public getIsDragging(): boolean {
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



    private mouseDown(e: MouseEvent): void {
        for (const state of this.states) {
            if (state.mouseDown(e, this)) {
                this.changeState(state);
                return;
            }
        }
    }


    private mouseUp(e: MouseEvent): void {
        for (const state of this.states) {
            if (state.mouseUp(e, this)) {
                this.changeState(state);
                return;
            }
        }
    }

    private mouseMove(e: MouseEvent): void {
        for (const state of this.states) {
            if (state.mouseMove(e, this)) {
                this.changeState(state);
                return;
            }
        }
    }

    private dbClick(e: MouseEvent): void {
        for (const state of this.states) {
            if (state.DbClick(e, this)) {
                this.changeState(state);
                return;
            }
        }
    }


    public bindEvents(): void {

        // canvas mouse events
        this.grid.getCanvas().addEventListener("pointerdown", (e) => this.mouseDown(e));

        this.grid.getCanvas().addEventListener("pointermove", (e) => this.mouseMove(e));

        window.addEventListener("pointerup", (e) => this.mouseUp(e));

        this.grid.getCanvas().addEventListener("dblclick", (e) => this.dbClick(e));




        // undo/ redo handlers
        this.grid.getUndoButton().addEventListener("click", () => {
            this.grid.getUndoRedoManager().undo();
        });

        this.grid.getRedoButton().addEventListener("click", () => {
            this.grid.getUndoRedoManager().redo();
        });
    }



}