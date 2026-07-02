import { cell_height, cell_width, view_height, view_width } from "../constants/constants.js";
import { ActiveCell } from "./ActiveCell.js";
import { Cell } from "./Cell.js";
import { ColHeaderCell } from "./ColHeaderCell.js";
import { InnerCell } from "./InnerCell.js";
import { RowHeaderCell } from "./RowHeaderCell.js";



type HTMLCanvasElementOrNull = HTMLCanvasElement | null;
type HTMLElementOrNull = HTMLElement | null;





export class Grid {
    private rows: number;
    private cols: number;
    private canvasEle: HTMLCanvasElementOrNull;
    private ctx: any;

    private canvasWidth: number;
    private canvasHeight: number;

    private offsetX: number;
    private offsetY: number;

    private activeCell: ActiveCell;


    private allInnerCells: Map<string, InnerCell>;
    private allRowHeaderCells: Map<string, RowHeaderCell>;
    private allColHeaderCells: Map<string, ColHeaderCell>;


    constructor(
        rows: number,
        cols: number,
        canvasEle: HTMLCanvasElementOrNull,
    ) {
        this.rows = rows;
        this.cols = cols;
        this.canvasEle = canvasEle;

        // set canvas size
        this.canvasHeight = 0;
        this.canvasWidth = 0;
        if (this.canvasEle) {
            // this.canvasEle.width = view_width;
            // this.canvasEle.height = view_height;

            this.canvasHeight = this.canvasEle.height;
            this.canvasWidth = this.canvasEle.width;
        }

        // get context
        if (this.canvasEle) {
            this.ctx = this.canvasEle.getContext("2d");
        }

        this.offsetX = 0;
        this.offsetY = 0;

        this.activeCell = new ActiveCell(-1, -1);

        this.allInnerCells = new Map();
        this.allColHeaderCells = new Map();
        this.allRowHeaderCells = new Map();


        // add click event listener
        this.addClickEventListener();
        this.addKeyDownEventListener();
        this.addBlurEventListener();


    }

    public renderWithDynamicViewport() {
        const viewportId: string = "scroll-viewport";
        const viewport = document.getElementById(viewportId) as HTMLDivElement | null;

        if (!viewport) {
            console.warn(`Viewport element with id "${viewportId}" not found. Scrolling will be disabled.`);
            return;
        }

        // initial draw
        this.drawExcelSheetGrids();

        viewport.addEventListener("scroll", () => {
            this.offsetX = viewport.scrollLeft;
            this.offsetY = viewport.scrollTop;

            this.drawExcelSheetGrids();
        });
    }


    private addClickEventListener() {

        

        if (!this.canvasEle) return;

        this.canvasEle.addEventListener('click', (e) => {

             // clear previous active cells
            this.activeCell.setTargetCol(-1);
            this.activeCell.setTargetRow(-1);

            if (!this.canvasEle) return;


            const rect = this.canvasEle.getBoundingClientRect();
            const clickX = e.clientX - rect.left + this.offsetX;
            const clickY = e.clientY - rect.top + this.offsetY;

            const targetCol = Math.floor(clickX / cell_width) - 1;
            const targetRow = Math.floor(clickY / cell_height) - 1;


            if (targetCol >= 0 && targetRow >= 0 && targetCol < this.cols && targetRow < this.rows) {
                this.activeCell.setTargetCol(targetCol);
                this.activeCell.setTargetRow(targetRow);
            }

            // rerender
            this.renderWithDynamicViewport();
        });
    }



    public drawExcelSheetGrids(): void {

        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);



        // 1. Calculate which row/column indexes are visible in the window box
        const startCol = Math.floor(this.offsetX / cell_width);
        const endCol = Math.min(this.cols, startCol + Math.ceil(view_width / cell_width) + 1);

        const startRow = Math.floor(this.offsetY / cell_height);
        const endRow = Math.min(this.rows, startRow + Math.ceil(view_height / cell_height) + 1);


        // draw inner cells
        for (let r = startRow; r < endRow; r++) {
            for (let c = startCol; c < endCol; c++) {
                const key: string = `${r}, ${c}`;

                if (!this.allInnerCells.has(key)) {
                    const cell: InnerCell = new InnerCell(
                        cell_width,
                        cell_height,
                        r,
                        c,
                        this.offsetX,
                        this.offsetY,
                        this.ctx,
                        this.canvasHeight,
                        this.canvasWidth
                    );

                    this.allInnerCells.set(key, cell);

                }

                const inputField = document.getElementById('editor') as HTMLInputElement;
                const cell: InnerCell = this.allInnerCells.get(key)!;
                if (cell.getRow() === this.activeCell.getTargetRow() && cell.getCol() === this.activeCell.getTargetCol()) {
                    cell.setInputText(inputField.value);
                }
                cell.drawCell();
            }
        }


        // draw top rows
        this.drawHeader();

        // update editor
        this.updateEditor();


    }

    private updateEditor() {

        const inputField = document.getElementById('editor') as HTMLInputElement;

        if (!inputField)
            return;

        if (this.activeCell.getTargetRow() == -1) {
            inputField.style.display = 'none';
            return;
        }

        const tx = (this.activeCell.getTargetCol() + 1) * cell_width - this.offsetX;
        const ty = (this.activeCell.getTargetRow() + 1) * cell_height - this.offsetY;


        if (tx < cell_width || tx > this.canvasWidth - 5 || ty < cell_height || ty > this.canvasHeight - 5) {
            inputField.style.display = 'none';
            inputField.value = "none";
            return;
        }

        const cell : InnerCell = this.allInnerCells.get(`${this.activeCell.getTargetRow()}, ${this.activeCell.getTargetCol()}`)!;

        inputField.style.left = `${tx}px`;
        inputField.style.top = `${ty}px`;
        inputField.style.width = `${cell_width}px`;
        inputField.style.height = `${cell_height}px`;
        inputField.style.display = 'block';
        inputField.value = cell.getInputText();
        inputField.focus();
        inputField.className = "absolute border border-blue-600 hover:border-blue-700 outline-none bg-white p-0 text-[10px] leading-none z-20"

    }


    private drawHeader() {
        this.ctx.font = "12px sans-serif";

        // top row and top column cell
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, cell_width, cell_height);

        // top row (colHeaderCell)
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(cell_width, 0, this.canvasWidth, cell_height);

        for (let c = 0; c < this.cols; c++) {
            const key: string = `${-1}, ${c}`;

            if (!this.allColHeaderCells.has(key)) {
                const colHeaderCell: ColHeaderCell = new ColHeaderCell(
                    cell_width,
                    cell_height,
                    -1,
                    c,
                    this.offsetX,
                    this.offsetY,
                    this.ctx,
                    this.canvasHeight,
                    this.canvasWidth
                );

                this.allColHeaderCells.set(key, colHeaderCell);
            }

            const colHeaderCell: ColHeaderCell = this.allColHeaderCells.get(key)!;
            colHeaderCell.drawCell();
        }

        // left column (rowHeaderCell)
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, cell_height, cell_width, this.canvasHeight);

        for (let r = 0; r < this.rows; r++) {

            const key: string = `${r}, ${-1}`;

            if (!this.allRowHeaderCells.has(key)) {
                const rowHeaderCell: RowHeaderCell = new RowHeaderCell(
                    cell_width,
                    cell_height,
                    r,
                    -1,
                    this.offsetX,
                    this.offsetY,
                    this.ctx,
                    this.canvasHeight,
                    this.canvasWidth
                );

                this.allRowHeaderCells.set(key, rowHeaderCell);
            }


            const rowHeaderCell: RowHeaderCell = this.allRowHeaderCells.get(key)!;
            rowHeaderCell.drawCell();
        }

    }

    private addKeyDownEventListener(): void {
        const inputField = document.getElementById('editor') as HTMLInputElement;

        // Allow hitting 'Enter' to save values immediately instead of just manual blurs
        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                inputField.blur();
            }
        });
    }

    private addBlurEventListener(): void {
        const inputField = document.getElementById('editor') as HTMLInputElement;

        inputField.addEventListener('blur', () => {

            if (this.activeCell.getTargetCol() !== -1) {
                this.renderWithDynamicViewport();

                // set active cell to {-1, -1}
                this.activeCell.setTargetCol(-1);
                this.activeCell.setTargetRow(-1);
                
                inputField.value = "";
                inputField.style.display = "none";
            }
        });

    }


}