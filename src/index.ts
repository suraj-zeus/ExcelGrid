import { TOTAL_COLS, TOTAL_ROWS } from "./constants.js";
import { Grid } from "./Grid.js";




window.addEventListener('DOMContentLoaded', () => {

    const canvasGrid = document.getElementById('gridCanvas') as HTMLCanvasElement;
    const scrollBox = document.getElementById('scrollBox') as HTMLDivElement;
    const spacer = document.getElementById('spacer') as HTMLDivElement;
    const inputEle = document.getElementById('cellEditor') as HTMLInputElement;


    const grid = new Grid(
        canvasGrid,
        scrollBox,
        spacer,
        inputEle,
        TOTAL_ROWS,
        TOTAL_COLS,
    );


});
