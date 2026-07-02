


import { Cell } from "./Cell.js";


export class RowHeaderCell extends Cell {

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
    )  {
        super(cellWidth, cellHeight, row, col, offsetX, offsetY, ctx, canvasHeight, canvasWidth);
    }

    public drawCell() : void {
        

        // skip rendering this -> overflow 
        if(this.ty < this.cellHeight || this.ty > this.canvasHeight) {
            return;
        }


        // set styles
        this.ctx.strokeStyle = '#000'; // border color
        this.ctx.fillStyle = '#000'; // inner text color
        this.ctx.font = '12px sans-serif';  // font 

        this.ctx.strokeRect(this.tx, this.ty, this.cellWidth, this.cellHeight);
        this.ctx.fillText(this.row + 1,  this.tx + (this.cellWidth / 2) - 5, this.ty + (this.cellHeight / 2));
    }
}