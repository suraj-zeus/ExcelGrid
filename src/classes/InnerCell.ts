import { Cell } from "./Cell.js";







export class InnerCell extends Cell{

    protected inputText : string;


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
       super(cellWidth, cellHeight, row, col, offsetX, offsetY, ctx, canvasHeight, canvasWidth);
       this.inputText = "";
    }

    public drawCell() : void {
        // skip rendering this -> overflow 
        if(this.tx < this.cellWidth || this.tx > this.canvasWidth || this.ty < this.cellHeight || this.ty > this.canvasHeight) {
            return;
        }

        // set styles
        this.ctx.strokeStyle = '#000'; // border color
        this.ctx.fillStyle = '#000'; // inner text color
        this.ctx.font = '12px sans-serif';  // font 
        this.ctx.strokeRect(this.tx, this.ty, this.cellWidth, this.cellHeight);
        this.ctx.save();


        this.ctx.beginPath();
         this.ctx.rect(this.tx, this.ty, this.cellWidth, this.cellHeight);
         this.ctx.clip();
        this.ctx.fillText(this.inputText, this.tx + 5, this.ty + 20);

         this.ctx.restore(); 

    }

    public setInputText(text : string) {
        this.inputText = text;
    }

    public getInputText() : string {
        return this.inputText;
    }

    public setTx(tx : number) : void {
        this.tx = tx;

        this.bx = this.tx + this.cellWidth;
    }

    public setTy(ty : number) : void {
        this.ty = ty;

        this.by = this.ty + this.cellHeight;
    }


}

