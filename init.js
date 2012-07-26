if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function () {
        return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function ( callback,element) {
                window.setTimeout(callback, 1000 / 60); // Fallback timeout
            };
    })();
}

(function(global, undefined){

    function ns(namespaceString) {
        var parts = namespaceString.split('.'),
            parent = global,
            currentPart = '';

        for(var i = 0, length = parts.length; i < length; i++) {
            currentPart = parts[i];
            parent[currentPart] = parent[currentPart] || {};
            parent = parent[currentPart];
        }

        return parent;
    }
    global.ns=ns;




    var Automata = function(obj) {
        if (typeof obj != "object" || !obj) throw new Error("Config object not found");

        this.grid = obj.grid;
        this.brushes = obj.brushes;
        this.states = obj.states;
        this.cellMap = obj.initialState;

        var that = this;
        this.grid.callback = function(ev, cell) {
            switch (ev) {
                case "cell":
                    that.cellMap.setState(cell.x,cell.y, that.brushes.currentBrush || "copper");
                    that.render();
                    break;
                case "zoom":
                    that.render();
                    break;
            }
        }

        this.draw.bind(this);
    }

    Automata.prototype.render = function() {
        var cellMap= this.cellMap;
        var w = cellMap.w;
        var h = cellMap.h;
        var currentCells = cellMap.cells;
        var states = this.states;
        var cells = [];

        for (var i = 0, len = currentCells.length; i<len; i++) {
            var x = i%w;
            var y = (i-x)/w;
            var cell = currentCells[i];

            if (cell.nextState && cell.nextState!=cell.state){
                cell.state=cell.nextState;
                delete cell.nextState;
            }

            cells.push({ x: x, y: y, color: states[cell.state] });
        }

        this.grid.renderGrid();
        this.grid.renderCells(cells);
    }

    Automata.prototype.evolve = function() {
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

    Automata.prototype.start = function(){
        this.isAnimating = true;
        if (!this.animateRunning) this.draw();
    }
    Automata.prototype.stop=function(){
        this.isAnimating = false;
    }
    Automata.prototype.nextStep=function(){
        this.stop();
        this.evolve();
        this.render();
    }
    Automata.prototype.reset=function(){
        this.stop();
        this.cellMap.reset();
        this.render();
    }

    Automata.prototype.draw=function(){
        if (this.isAnimating) {
            // Only draw if we are drawing
            this.evolve();
            this.render();

            var automata = this;
            requestAnimationFrame(function(){
                automata.draw();
            });
        }
    }

    //Exports Grid constructor
    global.Automata = Automata;

})(this);

function init(canvasId){

    var cellMap = new WireWorld.CellMap(160, 120, "blank");
    //Line of cooper
    for (var i = 0; i<100; i++) {
        cellMap.setState(10+i,10,"copper");
    }
    cellMap.setState(13,10,"head");
    cellMap.setState(12,10,"tail");

    //Split signal
    for (var i = 0; i<30; i++) {
        cellMap.setState(10+i,20,"copper");
    }
    for (var i = 30; i<100; i++) {
        cellMap.setState(10+i,21,"copper");
    }
    for (var i = 30; i<100; i++) {
        cellMap.setState(10+i,19,"copper");
    }
    cellMap.setState(13,20,"head");
    cellMap.setState(12,20,"tail");


    //Diodo OK
    for (var i = 0; i<100; i++) {
        cellMap.setState(10+i,30,"copper");
    }
    cellMap.setState(40,29,"copper");
    cellMap.setState(40,31,"copper");
    cellMap.setState(39,29,"copper");
    cellMap.setState(39,31,"copper");
    cellMap.setState(40,30,"blank");

    cellMap.setState(13,30,"head");
    cellMap.setState(12,30,"tail");


    for (var i = 0; i<100; i++) {
        cellMap.setState(10+i,35,"copper");
    }
    cellMap.setState(40,34,"copper");
    cellMap.setState(40,36,"copper");
    cellMap.setState(39,34,"copper");
    cellMap.setState(39,36,"copper");
    cellMap.setState(39,35,"blank");
    cellMap.setState(13,35,"head");
    cellMap.setState(12,35,"tail");


    var automata = new Automata({
        grid: new WireWorld.Grid({
            canvasId: canvasId,
            rangeId: 'zoom'
        }),
        brushes: new WireWorld.Brushes({
            brushesId: "brushes"
        }),
        states: {
            "copper": "#804C00",
            "head": "red",
            "tail": "yellow",
            "blank": "black"
        },
        initialState: cellMap
    });

    automata.render();

    document.getElementById("start").onclick=function(){
        automata.start();
    };
    document.getElementById("stop").onclick=function(){
        automata.stop();
    };
    document.getElementById("ff").onclick=function(){
        automata.nextStep();
    };
    document.getElementById("reset").onclick=function(){
        automata.reset();
    };

    return automata;



}