import type { Grid } from "./Grid.js";


export class WindowEventHandler {
    constructor(private grid : Grid) {

    }


    public bindEvents() {
        // scrolling
        this.grid.getScrollBox().addEventListener("scroll", () => {
            this.grid.setScroll(this.grid.getScrollBox().scrollLeft, this.grid.getScrollBox().scrollTop);
            this.grid.render();
        });

        // window resize
        window.addEventListener("resize", () => {
            this.grid.resizeCanvas();
            this.grid.render();
        });

    }
}