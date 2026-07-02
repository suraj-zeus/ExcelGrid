




export class Cell {
    protected cellWidth: number;
    protected cellHeight: number;

    protected row : number;
    protected col : number;

    protected tx: number;
    protected ty: number;
    protected bx: number;
    protected by: number;

    protected offsetX: number;
    protected offsetY: number;

    protected ctx : any;
    protected canvasHeight : number;
    protected canvasWidth : number;

    constructor(
        cellWidth: number,
        cellHeight: number,

        row : number,
        col : number,

        offsetX: number,
        offsetY: number,

        ctx : any,
        canvasHeight : number,
        canvasWidth : number
    ) {
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.row = row;
        this.col = col;

        this.tx = (this.col + 1) * this.cellWidth - this.offsetX;
        this.ty = (this.row + 1) * this.cellHeight- this.offsetY;

        this.bx = this.tx + this.cellWidth;
        this.by = this.ty + this.cellHeight;

        this.ctx = ctx;
        this.canvasHeight = canvasHeight;
        this.canvasWidth = canvasWidth;
    }

    public drawCell() : void {
        
    }

    public getRow() : number {
        return this.row;
    }

    public getCol() : number {
        return this.col;
    }

   

}

