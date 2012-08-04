ns("WireWorld");

WireWorld.Automata = function(obj) {
    if (typeof obj != "object" || !obj) throw new Error("Config object not found");

    //Copture config objects
    this.grid = obj.grid;
    this.brushes = obj.brushes;
    this.states = obj.states;
    this.cellMap = obj.initialState;

    var that = this;
    this.grid.bind("draw", function(cell) {
        //Change cell state
        that.cellMap.setState(cell.x,cell.y, that.brushes.currentBrush || "copper");

        //Pass the cells to the grid
        that.grid.updateCells(that.cellMap, that.states);
        that.grid.refresh();
    });

    this.draw = this.draw.bind(this);
}

WireWorld.Automata.prototype.render = function() {
    this.grid.updateCells(this.cellMap, this.states);
    this.grid.refresh();
}
WireWorld.Automata.prototype.evolve = function() {
    // Rules
    //
    // a blank square always stays blank
    // an electron head always becomes an electron tail
    // an electron tail always becomes copper
    // copper stays as copper unless it has just or two neighbours that are electron heads, in which case it becomes an electron head
    //
    // (Extracted from  http://www.quinapalus.com/wires0.html)
    var cellMap= this.cellMap;
    var w = cellMap.w;
    var h = cellMap.h;

    var currentCells = cellMap.cells;

    for (var i = 0, len = currentCells.length; i<len; i++) {
        var cell = currentCells[i];
        var state = cell.state;
        switch (state) {
            case "blank":
                cell.nextState="blank";
                break;
            case "head":
                cell.nextState="tail";
                break;
            case "tail":
                cell.nextState="copper";
                break;
            case "copper":
                var y = i%w;
                var x = (i-y)/w;
                var headNeighbor = cellMap.getNeighbors(x, y)["head"];
                if (headNeighbor == 1 || headNeighbor == 2 ) {
                    cell.nextState="head";
                }else{
                    cell.nextState="copper";
                }
                break;
        }
    }


}

WireWorld.Automata.prototype.start = function(){
    this.isAnimating = true;
    if (!this.animateRunning) this.draw();
}
WireWorld.Automata.prototype.stop=function(){
    this.isAnimating = false;
}
WireWorld.Automata.prototype.nextStep=function(){
    this.stop();
    this.evolve();
    this.render();
}
WireWorld.Automata.prototype.reset=function(){
    this.stop();
    this.cellMap.reset();
    this.render();
}
WireWorld.Automata.prototype.load=function(pattern){
    this.stop();
    this.cellMap.load(pattern);
    this.render();
}
WireWorld.Automata.prototype.save=function(){
    this.stop();
    return this.cellMap.save();
}

WireWorld.Automata.prototype.draw=function(){
    if (this.isAnimating) {
        // Only draw if we are drawing
        this.evolve();
        this.render();
        requestAnimationFrame(this.draw);
    }
}