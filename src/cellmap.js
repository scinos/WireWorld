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
WireWorld.CellMap = function(w, h, defaultState){
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
    for (var i = 0, len = this.w*this.h; i<len; i++) {
        this.cells[i]= {
            state: this.defaultState
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
    this.cells[ x + y*this.w].state=state;
    this.cells[ x + y*this.w].nextState=state;
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
    //   - Auto-generated if statements using a macro, safer against bugs but difficult to read.

    var w = this.w,               //Shortcut to Cellmap's weigth
        h = this.h,               //Shortcut to Cellmap's height
        cells = this.cells,       //Shortcut to Cellmap's cells
        states= {},               //Hashmap with state=>count pairs
        state;                    //Aux variable to hold state

    //Top-left neighbor
    if (x-1 >= 0 && x-1 <= w &&  y-1 >= 0 && y-1 <= h) { state = cells[ (x-1)*w + (y-1) ].state; ++states[state]||(states[state]=1); }

    //Top neighbor
    if (x   >= 0 && x   <= w &&  y-1 >= 0 && y-1 <= h) { state = cells[ (x  )*w + (y-1) ].state; ++states[state]||(states[state]=1); }

    //Top-right neighbor
    if (x+1 >= 0 && x+1 <= w &&  y-1 >= 0 && y-1 <= h) { state = cells[ (x+1)*w + (y-1) ].state; ++states[state]||(states[state]=1); }

    //Left neighbor
    if (x-1 >= 0 && x-1 <= w &&  y   >= 0 && y   <= h) { state = cells[ (x-1)*w + (y  ) ].state; ++states[state]||(states[state]=1); }

    //Right neighbor
    if (x+1 >= 0 && x+1 <= w &&  y   >= 0 && y   <= h) { state = cells[ (x+1)*w + (y  ) ].state; ++states[state]||(states[state]=1); }

    //Bottom-right neighbor
    if (x-1 >= 0 && x-1 <= w &&  y+1 >= 0 && y+1 <= h) { state = cells[ (x-1)*w + (y+1) ].state; ++states[state]||(states[state]=1); }

    //Bottom neighbor
    if (x   >= 0 && x   <= w &&  y+1 >= 0 && y+1 <= h) { state = cells[ (x  )*w + (y+1) ].state; ++states[state]||(states[state]=1); }

    //Bottom-left neighbor
    if (x+1 >= 0 && x+1 <= w &&  y+1 >= 0 && y+1 <= h) { state = cells[ (x+1)*w + (y+1) ].state; ++states[state]||(states[state]=1); }


    //States looks like:
    // {   "myState1": 0,
    //     "myState2": 3,
    //     ...
    // }
    return states;
}

WireWorld.CellMap.prototype.save = function() {
    var output = "";
    for (var i = 0, len = this.w*this.h; i<len; i++) {
        var cell = this.cells[i];
        switch (cell.state) {
            case "blank": output += "."; break;
            case "copper": output += "C"; break;
            case "head": output += "H"; break;
            case "tail": output += "T"; break;
        }
        if ( i%this.w == this.w-1 ) {
            output+="$";
        }
    }


    function compress(prefix){
        return function(match) {
            return match.length + prefix;
        };
    }

    output = output.
        replace(/\.+/g, compress(".")).
        replace(/C+/g, compress("C")).
        replace(/H+/g, compress("H")).
        replace(/T+/g, compress("T"));

    return output;
}

WireWorld.CellMap.prototype.load = function(input) {
    this.reset();

    function expand(prefix){
        return function(match, group) {
            return Array(+group + 1).join(prefix);
        };
    }

    input = input.
        replace(/(\d+)\./g,expand(".")).
        replace(/(\d+)H/g, expand("H")).
        replace(/(\d+)C/g, expand("C")).
        replace(/(\d+)T/g, expand("T")).
        replace(/\$/g,"");

    for (var i = 0, len = input.length; i<len; i++) {
        var ch = input[i];
        switch (ch) {
            case ".": this.cells[i].state="blank"; break;
            case "H": this.cells[i].state="head"; break;
            case "C": this.cells[i].state="copper"; break;
            case "T": this.cells[i].state="tail"; break;
        }
    }

}
