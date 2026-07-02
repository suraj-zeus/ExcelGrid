import { Grid } from "./classes/Grid.js";
import { cols, rows } from "./constants/constants.js";




const canvas = document.getElementById('spreadsheet');


const grid : Grid = new Grid(
    rows,
    cols,
    canvas as HTMLCanvasElement
);


grid.renderWithDynamicViewport();