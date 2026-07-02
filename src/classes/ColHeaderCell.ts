import { Cell } from "./Cell.js";


export class ColHeaderCell extends Cell {

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
        if(this.tx < this.cellWidth || this.tx > this.canvasWidth) {
            return;
        }


        // set styles
        this.ctx.strokeStyle = '#000'; // border color
        this.ctx.fillStyle = '#000'; // inner text color
        this.ctx.font = '12px sans-serif';  // font 

        this.ctx.strokeRect(this.tx, this.ty, this.cellWidth, this.cellHeight);
        this.ctx.fillText(this.getColumnHeaderName(this.col),  this.tx + (this.cellWidth / 2) - 5, this.ty + (this.cellHeight / 2));
    }


    private getColumnHeaderName(colInd : number):string
    {
        let name="";
        let value=colInd;
        while(value>=0)
        {
            name=String.fromCharCode((value%26)+65)+name;
            value=Math.floor(value/26)-1;
        }
        return name;
    }
}