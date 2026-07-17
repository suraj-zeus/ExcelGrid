
# Excel Grid Viewer



## Steps to run this project

- Open this project in any IDE and install the dependencies by running this command : 

    ```
        npm install
    ```

- Run the following command to compile typescript files :

    ```
        npm run build
    ```
- Generate sample json employees data by running this command 

    ```
        npm run seed
    ```

- Open index.html on any browser


## Features implemented 

- Rendering - Renders 100000 rows and 500 columns 
- Selection - Selects single cell, all cells in a row, all cells in a column and all cells in a rectangular region
- Resizing - Resizes a row or column by dragging the row/column header borders
- Cell editing - Handles cell text editing
- Status bar - Canculates the statistical measures like count, min, max, sum and avg for a selection
- Undo/Redo - Handles undo/redo for cell editing and row/column resizing
- Formula parsing - Currently handles formula parsing for the text written in this format SUM(a1:b2) and =a1+b2


## Folder structure and Class Structure

    ``` 
        - dist/
        - src/
            - Interfaces/
                - IMouseState.ts                - Strategy interface for all the mouse states
            - MouseStates/
                - CellSelectionMouseState.ts    - Mouse state for inner cell selection
                - ColResizeState.ts             - Mouse state for column resize
                - ColSelectionSate.ts           - Mouse state for selection of all rows in a column
                - RowResizeState.ts             - Mouse state for row resize
                - RowSelectionState.ts          - Mouse state for selection of all columns in a row
            - CellEditor.ts                     - Handles cell editing task
            - Command.ts                        - Parent class of all the commands
            - constants.ts                      - Stores constant values
            - DataStore.ts                      - Stores text values for each cell
            - DimensionManager.ts               - Handles row and columns size with offset calculation
            - EditCellTextCommand.ts            - Command for cell text editing
            - EventManager.ts                   - Binds all the events 
            - FormulaEngine.ts                  - Handles formula parsing
            - generateJsonData.ts               - Generates 50k employee data on running seed command
            - Grid.ts                           - Main coordinator class that wires every other class
            - GridRenderer.ts                   - Renders the excel grids in canvas
            - index.ts                          - Main entry point for this project
            - KeyboardEventHandler.ts           - Binds all keyboard event handlers
            - MouseEventHandler.ts              - Binds all mouse event handlers
            - ResizeCommand.ts                  - Command for row/column resizing
            - ResizeManager.ts                  - Handler resizing tasks
            - Selection.ts                      - Handles cell, row, column and range of cells selection
            - StatusBarManager.ts               - Computes count, min, max, sum and avg of numeric values present in a selected 
                                                  range of cells
            - types.ts                          - Custom typescript types used in this project
            - UndoRedoManager.ts                - It's a command manager that handles undo/redo tasks
            - WindowsEventHandler.ts            - Binds window event handlers 
        - index.html
        - style.css

    ```




## OOPs and SOLID 

- OOPs - All features are implemented using classes and objects
- Single Responsibility - Every class has its own resposibilities. It only contains the attributes and methods to handle its own responsibility.

    
    ```
        eg : 
            - Selection class has just one resposibility which is to manage the states related to selection.
            - UndoRedoManager has just one responsibility which is to manage the states related to undo/redo operation.
    ```

- Open/Closed - Other features can be easily extended by creating new classes/objects or by inheriting properties/methods of existing classes. 
    
    ```
        eg : 
            - EditCellTextCommand and ResizeCommand extends to Command class.
            - New commands can be easily added by extending to existing Command class.
    ```
- Liskov Substitution: Commands implementing `Command` can be used interchangeably by `CommandManager`.
- Interface Segregation: Small interfaces like `Command` keep behavior narrow and specific.`Command` has only `redo()` and `undo()`, ensuring implementing classes are not forced to write unnecessary methods
- Dependency Inversion: Higher-level classes depend on abstractions and injections rather than concrete instantiations. Classes like FormulaEngine and GridRendered receives the objects via constructor injection allowing for modularity, easier testing and clear contracts.



## Command Pattern

### Parent class for all commands

    ```
        export class Command {

            constructor() { }

            public undo(): void { }

            public redo(): void { }
        }

    ```

- Individual commands extend to this parent class
- ex : 

        
    | Command | `redo()` | `undo()` |
    |---------|-------------|----------|
    | `EditCellTextCommand` | `datastore.setValue(row, col, newValue)` | `datastore.setValue(row, col, oldValue)` |
    | `ResizeColumnCommand` | `dimensionManager.setSize(index, newSize)` | `dimensionManager.setSize(index, oldSize)` |

    Each command stores both `oldValue` and `newValue` at creation time.



## Virtual Rendering

- This excel grid contains 100000 rows and 500 columns. So, browser won't be able to handle rendering 100000 * 500 cells at once.
- So, we only render those cells which should be currently visible on the screen
- For this, we have few parameters like scrollX, scrollY, offsetX and offsetY, which help us to calculate minRow, minCol, maxRow and maxCol.
- So, at once we only renders rows from minRow to maxRow and columns from minCol to maxCol which in visible on the screen


    ```
        // this gives the range of indices for current visible cells
        minCol = scrollX
        maxCol = scrollX + canvasWidth
        minRow = scrollY 
        maxRow = scrollY + canvasHeight


        FOR row FROM minRow TO maxRow :
            FOR col FROM minCol TO maxCol :

                // coordinates and sizes 
                tx = offset(col) - scrollX + rowHeaderWidth
                ty = offsetY(row) - scrollY + colHeaderHeight
                w = colManager.getSize(col)
                h = rowManager.getSize(row)
                
                // draw cells
                ctx.fillRect(tx, ty, w, h)

            END FOR
        END FOR

    ```


## Data Generation : 

- Excel sheet loads around 50000 records of employee data while rendering
- This data is generated by running the command 

    ```
        npm run seed
    ```
- It executes the script written in generateJsonData.ts
- This file contains arrays as firstNames, surNames, ages and salaries. So by traversing 50000 times, it selects a random firstName, surName, age and salary from these arrays and stores this in employees.json as employee record.
- Datastore finally loads and stores these employees records from employees.json at runtime before rendering.


## Undo/Redo Working : 

Undo and Redo functionality is implemented using the Command Pattern.
 
Supported operations include:
 
- Cell editing
- Column / Row resizing
 
Each operation is stored as a command.
When an action occurs, it is passed to the Undo/Redo manager, which executes it and pushes it to an undoStack. When Ctrl+Z is pressed, the manager pops the command, calls its undo() method, and pushes it to a redoStack.

# Test Cases Covered

The application was tested for the following scenarios:
 
- Rendering 100,000 rows
- Rendering 500 columns
- Horizontal scrolling
- Vertical scrolling
- Cell editing
- Formula evaluation
- Row selection
- Column selection
- Range selection
- Row resizing
- Column resizing
- Undo cell edits
- Redo cell edits
- Undo row resize
- Undo column resize
- Keyboard navigation
- Status bar calculations



## Performance Observations
- Virtual rendering keeps rendering independent of dataset size.
- Canvas rendering significantly reduces DOM overhead.
- Rendering performance remains smooth even for datasets containing 100,000 rows.


## Accessibility Considerations
* **Overcoming Canvas Limitations**: An HTML5 `<canvas>` looks like a flat image to a computer, making its grid invisible to screen readers. To fix this, we pop up a real HTML `<input>` box whenever you edit a cell so screen readers can read the text out loud.

* **Keyboard Navigation**: You can use arrow keys to move selection left, right, up and down. Also, use can use CTRL + Z to undo and CTRL + Y to redo actions like resizing and cell text editing.

* **Summary Status Bar**: The calculations bar (Count, Min, Max, Sum, Average) displays its results in standard HTML elements outside the canvas so user may know the summary of a range selection.

* **Selection Accessibility**: We use thick, bold borders alongside colors to show which cells are selected, ensuring colorblind users can see their selection clearly.



## Limitations

### Data & Storage
- **Number of columns are fixed.** There is no way to add new data columns at runtime.
- **No persistent storage.** All data is in-memory. Refreshing the page resets everything.
- **No CSV/Excel import or export.**

### Formula Engine
- **Only arithmetic is supported**: `+`, `-`, `*`, `/`, parentheses, and `SUM(range)`. No `IF`, `AVERAGE`, `COUNT`, `MAX`, `MIN`, or other functions.

### Selection
- **No keyboard-extended selection** (Shift+Arrow to grow range)


### Editing
- **No multi-cell paste / fill-down** support.

### Rendering
- **No cell merging.**
- **No text wrapping** — text is clipped at cell boundaries.
- **No font/color/bold/italic formatting** per cell.

