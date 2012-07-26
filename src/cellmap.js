ns("WireWorld");

/**
 * Holds information about a two-dimensional set of cells with a state.
 * The plane is not cyclic, it has borders. For example, the top-left cell only has three neighbors.
 * (A neighbor is defined as any of the 8 cells surrounding a particular cell)
 *
 * @param w {Number} Width
 * @param h {Number} Height
 * @param defaultState {String} State to use as default for all cells
 * @constructor
 */
WireWorld.CellMap = function (w, h, defaultState) {
    //This class stores the two-dimensional array into a one-dimension array to avoid nested
    //loops. The math involved is:
    //  2d(x,y)  --> 1d( x*D + y)
    //  D is the size of any dimension from 2d array.
    //  1d.length --> D*D2 (size of both dimensions from 2d array)
    //
    // In this particular implementation, width (1st dimension from 2d) is used as D dimension.

    // Each cell is created as an object instead as a single value. This is useful to store more information
    // (i.e. the state of the next generation) into the cell.

    //Create the cells array
    var cells = this.cells = [];

    //Save width and height
    this.w = w;
    this.h = h;
    this.defaultState = defaultState;

    //Set default initial state
    this.reset();
}

/**
 * Reset the CellMap to initial state
 */
WireWorld.CellMap.prototype.reset = function () {
    //Populate the array with the initial set of cells with the default state
    for (var i = 0, len = this.w * this.h; i < len; i++) {
        this.cells[i] = {
            state:this.defaultState
        };
    }
}

/**
 * Sets the state of a cell
 *
 * @param x
 * @param y
 * @param state
 */
WireWorld.CellMap.prototype.setState = function (x, y, state) {
    // As cells are stored in a single-dimension array, we need
    // a little math to get the right index.
    this.cells[ x + y * this.w].state = state;
    this.cells[ x + y * this.w].nextState = state;
}

/**
 * Returns a hashmap with state=>count pairs from neighbor cells
 *
 * @param x
 * @param y
 * @return {Object}
 */
WireWorld.CellMap.prototype.getNeighbors = function (x,y) {
    //This function has been heavy optimized, decreasing legibility in the process.
    //   - Avoid function calls -> duplicated code
    //   - Short-circuit incrementer (++states[state]||(states[state]=1);) -> brain cruhser but pretty fast

    var w = this.w,               //Shortcut to Cellmap's weigth
        h = this.h,               //Shortcut to Cellmap's height
        cells = this.cells,       //Shortcut to Cellmap's cells
        states= {},               //Hashmap with state=>count pairs
        state;                    //Aux variable to hold state

    //Top-left neighbor (x-1, y-1)
    if (x - 1 >= 0 && x - 1 <= h && y - 1 >= 0 && y - 1 <= w) {
        state = cells[ (x - 1) * w + (y - 1) ].state;
        ++states[state] || (states[state] = 1);
    }

    //Top neighbor  (x, y-1)
    if (x >= 0 && x <= h && y - 1 >= 0 && y - 1 <= w) {
        state = cells[ (x  ) * w + (y - 1) ].state;
        ++states[state] || (states[state] = 1);
    }

    //Top-right neighbor (x+1, y-1)
    if (x + 1 >= 0 && x + 1 <= h && y - 1 >= 0 && y - 1 <= w) {
        state = cells[ (x + 1) * w + (y - 1) ].state;
        ++states[state] || (states[state] = 1);
    }

    //Left neighbor (x-1, y)
    if (x - 1 >= 0 && x - 1 <= h && y >= 0 && y <= w) {
        state = cells[ (x - 1) * w + (y  ) ].state;
        ++states[state] || (states[state] = 1);
    }

    //Right neighbor (x+1, y)
    if (x + 1 >= 0 && x + 1 <= h && y >= 0 && y <= w) {
        state = cells[ (x + 1) * w + (y  ) ].state;
        ++states[state] || (states[state] = 1);
    }

    //Bottom-right neighbor (x-1, y+1)
    if (x - 1 >= 0 && x - 1 <= h && y + 1 >= 0 && y + 1 <= w) {
        state = cells[ (x - 1) * w + (y + 1) ].state;
        ++states[state] || (states[state] = 1);
    }

    //Bottom neighbor (x, y+1)
    if (x >= 0 && x <= h && y + 1 >= 0 && y + 1 <= w) {
        state = cells[ (x  ) * w + (y + 1) ].state;
        ++states[state] || (states[state] = 1);
    }

    //Bottom-left neighbor (x+1, y+1)
    if (x + 1 >= 0 && x + 1 <= h && y + 1 >= 0 && y + 1 <= w) {
        state = cells[ (x + 1) * w + (y + 1) ].state;
        ++states[state] || (states[state] = 1);
    }

    //states looks like:
    // {   "myState1": 0,     //0 cells have myState1
    //     "myState2": 3,     //3 cells have myState2
    //     ...
    // }
    return states;
}

/**
 * Returns the CellMap content in a simplified version of RLE
 * (http://psoup.math.wisc.edu/mcell/ca_files_formats.html#RLE)
 *
 * The format is:
 *    - . means blank (aka dead) cell
 *    - C, H and T stands for 'copper', 'head' and 'tail'
 *
 * @return {String}
 */
WireWorld.CellMap.prototype.save = function() {
    var output = "";
    for (var i = 0, len = this.w*this.h; i<len; i++) {
        var cell = this.cells[i];

        //Add the character matching the cell state
        switch (cell.state) {
            case "blank":  output += "."; break;
            case "copper": output += "C"; break;
            case "head":   output += "H"; break;
            case "tail":   output += "T"; break;
        }
    }

    return output;
}

/**
 * Loads the CellMap content from a simplified version of RLE
 * (http://psoup.math.wisc.edu/mcell/ca_files_formats.html#RLE)
 *
 * The format is:
 *    - . means blank (aka dead) cell
 *    - C, H and T stands for 'copper', 'head' and 'tail'
 *    - $ means new line
 *
 * @param input {string} CellMap data in simplified RLE format
 */
WireWorld.CellMap.prototype.load = function(input) {
    //Clear current state
    this.reset();

    //Loop all over the input
    for (var i = 0, len = input.length; i<len; i++) {
        var ch = input[i];

        //Skip new-line characters
        if (ch == "$") continue;

        //Select the right state based on the character from this iteration
        var cell = this.cells[i];
        switch (ch) {
            case ".": cell.state="blank"; break;
            case "H": cell.state="head"; break;
            case "C": cell.state="copper"; break;
            case "T": cell.state="tail"; break;
        }
    }
}

/*
    #MCell 4.00
#GAME Wireworld
#BOARD 160x120
#L 49.87C$46.C.C87.C$45.4C5.47C9.25C2.C$46.C.C4.C47.C7.27C2.C$45.2C.2C3.C5.40C3.C5.C27.C2.C$44.C.3C.C2.C4.C40.C3.C3.C.27C.C2.C$41.C.C7.C.C4.C5.25C11.C3.C.33C2.C$40.4C6.4C4.C4.C25.C11.C3.C33.C2.C$41.C.C7.C.C4.C4.C5.18C2.C12.C3.33C3.C$40.2C.2C5.2C.2C3.C4.C4.C18.C.C11.C.C3.C.27C.C3.C.C$39.C.3C.C3.C.3C.C2.C4.C4.C5.11C2.C.C10.2C.2C3.C27.C3.2C.2C$36.C.C7.C.C7.C.C4.C4.C4.C11.C.C.C9.C.C.C.C3.27C3.C.C.C.C$35.4C6.4C6.4C4.C4.C4.C5.4C2.C.C.C8.C.2C.2C.C3.25C3.C.2C.2C.C$36.C.C7.C.C7.C.C4.C4.C4.C4.C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$35.2C.2C5.2C.2C5.2C.2C3.C4.C4.C4.C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$34.C.3C.C3.C.3C.C3.C.3C.C2.C4.C4.C4.C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$31.C.C7.C.C7.C.C7.C.C4.C4.C4.C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$30.5C5.4C6.4C6.4C4.C4.C4.C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$31.C.C7.C.C7.C.C7.C.C4.C4.C4.C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$30.2C.2C5.2C.2C5.2C.2C5.2C.2C3.C4.C4.C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$29.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C2.C4.C4.C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$26.C.C7.C.C7.C.C7.C.C7.C.C4.C4.C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$25.5C5.4C6.5C5.4C6.5C3.C4.C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$26.C.C7.C.C7.C.C7.C.C7.C.C4.C4.C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$25.2C.2C5.2C.2C5.2C.2C5.2C.2C5.2C.2C3.C4.C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$24.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C2.C4.C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$21.C.C7.C.C7.C.C7.C.C7.C.C7.C.C4.C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$20.4C6.4C6.4C6.5C5.4C6.5C3.C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$21.C.C7.C.C7.C.C7.C.C7.C.C7.C.C4.C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$20.2C.2C5.2C.2C5.2C.2C5.2C.2C5.2C.2C5.2C.2C3.C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$19.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C2.C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$16.C.C7.C.C7.C.C7.C.C7.C.C7.C.C7.C.C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$15.4C6.5C5.4C6.4C6.5C5.4C6.4C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$16.C.C7.C.C7.C.C7.C.C7.C.C7.C.C7.C.C4.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$15.2C.2C5.2C.2C5.2C.2C5.2C.2C5.2C.2C5.2C.2C5.2C.2C3.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$14.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C2.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$11.C.C7.C.C7.C.C7.C.C7.C.C7.C.C7.C.C6.C2.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$10.4C6.4C6.4C6.4C6.4C6.5C5.4C6.C2.C.C.C.C7.2C.2C.2C.2C29.2C.2C.2C.2C$11.C.C7.C.C7.C.C7.C.C7.C.C7.C.C7.C.C6.C2.C.C.C.C8.C.2C.2C.C3.25C3.C.2C.2C.C$10.2C.2C5.2C.2C5.2C.2C5.2C.2C5.2C.2C5.2C.2C5.2C.2C5.C2.C.C.C.C9.C.C.C.C3.27C3.C.C.C.C$9.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C4.C2.C.C.C.C10.C.C.C3.C27.C3.C.C.C$6.C.C7.C.C7.C.C7.C.C7.C.C7.C.C7.C.C6.C4.C2.C.C.C.C11.3C3.C.27C.C3.3C$5.4C6.4C6.5C5.4C6.5C5.4C6.4C6.C4.C2.C.C.C.C16.33C$6.C.C7.C.C7.C.C7.C.C7.C.C7.C.C7.C.C6.C4.C2.C.C.C2.16C33.C$5.2C.2C5.2C.2C5.2C.2C5.2C.2C5.2C.2C5.2C.2C5.2C.2C5.C4.C2.C.C.C18.33C$4.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C4.C4.C2.C.C.C13.3C3.C.27C.C3.3C$.C.C7.C.C7.C.C7.C.C7.C.C7.C.C7.C.C6.C4.C4.C2.C.C.C12.C.C.C3.C27.C3.C.C.C$4C6.5C5.5C5.4C6.5C5.4C6.4C6.C4.C4.C2.C.C.C11.C.C.C.C3.27C3.C.C.C.C$.C.C7.C.C7.C.C7.C.C7.C.C7.C.C7.C.C6.C4.C4.C2.C.C.C10.C.2C.2C.C3.25C3.C.2C.2C.C$2C.2C5.2C.2C5.2C.2C5.2C.2C5.2C.2C5.2C.2C5.2C.2C5.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$.3C.C3.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$6.C.C7.C.C7.C.C7.C.C7.C.C7.C.C6.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$5.4C6.5C5.4C6.5C5.5C5.4C6.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$6.C.C7.C.C7.C.C7.C.C7.C.C7.C.C6.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$5.2C.2C5.2C.2C5.2C.2C5.2C.2C5.2C.2C5.2C.2C5.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$6.3C.C3.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C4.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$11.C.C7.C.C7.C.C7.C.C7.C.C6.C4.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$10.4C6.5C5.4C6.4C6.4C6.C4.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$11.C.C7.C.C7.C.C7.C.C7.C.C6.C4.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$10.2C.2C5.2C.2C5.2C.2C5.2C.2C5.2C.2C5.C4.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$11.3C.C3.C.3C.C3.C.3C.C3.C.3C.C3.C.3C.C4.C4.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$16.C.C7.C.C7.C.C7.C.C6.C4.C4.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$15.5C5.5C5.4C6.4C6.C4.C4.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$16.C.C7.C.C7.C.C7.C.C6.C4.C4.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$15.2C.2C5.2C.2C5.2C.2C5.2C.2C5.C4.C4.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$16.3C.C3.C.3C.C3.C.3C.C3.C.3C.C4.C4.C4.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$21.C.C7.C.C7.C.C6.C4.C4.C4.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$20.4C6.5C5.5C5.C4.C4.C4.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$21.C.C7.C.C7.C.C6.C4.C4.C4.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$20.2C.2C5.2C.2C5.2C.2C5.C4.C4.C4.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$21.3C.C3.C.3C.C3.C.3C.C4.C4.C4.C4.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$26.C.C7.C.C6.C4.C4.C4.C4.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$25.4C6.4C6.C4.C4.C4.C4.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$26.C.C7.C.C6.C4.C4.C4.C4.C4.C4.C4.C2.C.C.C9.2C.2C.2C.2C29.2C.2C.2C.2C$25.2C.2C5.2C.2C5.C4.C4.C4.C4.C4.C4.C4.C2.C.C.C10.C.2C.2C.C3.25C3.C.2C.2C.C$26.3C.C3.C.3C.C4.C4.C4.C4.C4.C4.C4.C4.C2.C.C.C11.C.C.C.C3.27C3.C.C.C.C$3.CTH25.C.C6.C4.C4.C4.C4.C4.C4.C4.C4.C2.C.C.C12.2C.2C3.C27.C3.2C.2C$2.C3.C23.4C6.C4.C4.C4.C4.C4.C4.C4.C4.C2.C.C.C13.C.C3.C.27C.C3.C.C$2.C3.C24.C.C6.C4.C4.C4.C4.C4.C4.C4.C4.C2.C.C.C14.C3.33C3.C$2.C3.C23.2C.2C5.C4.C4.C4.C4.C4.C4.C4.C4.C2.C.C.C14.C2.C33.C2.C$3.HTC25.3C.C4.C4.C4.C4.C4.C4.C4.C4.C4.C2.C.C.C14.C.C.33C2.C$2.C32.C4.C4.C4.C4.C4.C4.C4.C4.C4.C2.C.C.C14.C.C2.C.27C.C2.C$2.C32.C4.C4.C4.C4.C4.C4.C4.C4.C4.C2.C.C2.14C3.C2.C27.C2.C$2.C32.C4.C4.C4.C4.C4.C4.C4.C4.C4.C2.C.C20.C2.27C2.C$2.C32.C4.C4.C4.C4.C4.C4.C4.C4.C4.C2.C2.20C4.25C2.C$2.C80.C52.C$2.79C3.52C$
    */