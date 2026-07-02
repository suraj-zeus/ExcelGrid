

export class ActiveCell {
    private targetRow : number;
    private targetCol : number;

    constructor(targetRow : number, targetCol : number) {
        this.targetRow = targetRow;
        this.targetCol = targetCol;
    }

    setTargetRow(row : number) {
        this.targetRow = row;
    }

    setTargetCol(col : number) {
        this.targetCol = col;
    }

     getTargetRow() {
        return this.targetRow;
    }

    getTargetCol() {
        return this.targetCol;
    }


}