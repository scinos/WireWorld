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
    Automata.prototype.load=function(pattern){
        this.stop();
        this.cellMap.load(pattern);
        this.render();
    }
    Automata.prototype.save=function(){
        this.stop();
        return this.cellMap.save();
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

    document.getElementById("saveBtn").onclick=function() {
        document.getElementById("pattern").value = WireWorld.MCell.encode(automata.save(), 160, 120);
    };
    document.getElementById("loadBtn").onclick=function() {
        automata.load(WireWorld.MCell.decode(document.getElementById("pattern").value));
    };

    automata.load(WireWorld.MCell.decode("#MCell 4.00\n#GAME Wireworld\n#BOARD 160x120\n#L $$2.CTH18C6.TH21.14C$28.C2.C20.C13.C$12.11C6.2C.21C12.12C$2.CTH7C40.C13.C$12.11C29.14C$$11.2C15.3C$2.CTH6C.11C4.C3.T$11.2C14.H3.H20.14C$27.T3.C20.C13.C$11.2C15.3C.21C12.12C$2.CTH7C.10C29.C13.C$11.2C39.C2.11C$$$2.3C2.4C2.3C.C.4C4.4C.C4.4C.4C.C2.C9.4C.4C$2.C2.C.C2.C.C4.C.C7.C4.C4.C2.C.C4.C.C10.C2.C.C2.C$2.3C2.4C2.2C2.C.C7.C4.C4.C2.C.C4.2C11.C2.C.4C$2.C2.C.C2.C4.C.C.C7.C4.C4.C2.C.C4.C.C10.C2.C.C.C$2.3C2.C2.C.3C2.C.4C4.4C.4C.4C.4C.C2.C9.4C.C2.C$$$$3.TH$2.C2.C$3.2C6.6C10.6C$5.C5.C5.C9.C5.C9.C2.C.4C.4C$5.C5.C4.4C7.C4.4C7.C2.C.C2.C.C2.C$5.7C4.C2.9C4.C2.6C3.2C2.C2.C.4C$5.C5.C4.4C7.C4.4C7.C2.C.C2.C.C.C$5.C5.C5.C9.C5.C9.C2.C.4C.C2.C$5.C5.2C2.2C10.6C$5.C$5.C$5.C$5.C$5.C$5.C$5.C45.4C.C2.C.3C2.C2.C.4C.3C$5.C45.C2.C.C2.C.C2.C.2C.C.C2.C2.C$5.C12.3C4.3C9.12C2.4C.2C.C.C2.C.C.2C.C2.C2.C$5.C12.C9.C.C6.C13.C2.C.C.2C.C2.C.C2.C.C2.C2.C$5.C12.C8.11C13.C2.C.C2.C.3C2.C2.C.4C2.C$5.14C8.C2.C$18.C8.11C$18.C9.C8.C$18.10C9.12C2.4C.3C$51.C2.C.C2.C$51.C2.C.C2.C$51.C2.C.3C$51.C2.C.C.C$51.4C.C2.C$"))
    document.getElementById("pattern").value = WireWorld.MCell.encode(automata.save(), 160, 120);

    return automata;
}