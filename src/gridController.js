ns("WireWorld");

WireWorld.GridController = function(obj) {
    /**
     * Reference to the last clicked cell
     * @type {Object}
     */
    this.lastCell={};

    this.viewportZoom=0.7;
    this.cellSize = 10;
    this.viewportStart = {x: 0, y: 0};
    this.height = obj.height;
    this.width = obj.width;

    var that = this;
    var controllerElement = document.getElementById(obj.element);
    var container = document.getElementById('automata');

    var backgroundLayer = this.backgroundLayer = new WireWorld.Grid.BackgroundLayer();
    backgroundLayer.init({
        container: container,
        width: 800,
        height: 600,
        cls: "background"
    });

    var cellLayer = this.cellLayer = new WireWorld.Grid.CellLayer();
    cellLayer.init({
        container: container,
        cls: 'grid',
        colors: ["#804C00", "red",  "yellow", "black"],
        defaultColor: 'black',
        width: 800,
        height: 600,
        color: '#444',
        cellSize: this.cellSize,
        maxSize: {x: this.width, y: this.height},
        viewportZoom: this.viewportZoom,
        viewportStart: this.viewportStart
    });

    var gridLayer = this.gridLayer = new WireWorld.Grid.GridLayer();
    gridLayer.init({
        container: container,
        cls: 'grid',
        width: 800,
        height: 600,
        color: '#444',
        cellSize: this.cellSize,
        maxSize: {x: this.width, y: this.height},
        viewportZoom: this.viewportZoom,
        viewportStart: this.viewportStart
    });
    gridLayer.render();

    //Aux function to detect mouse coordinates relative to the element
    function getOffset(ev) {
        var el = ev.target,
            x = y = 0;

        while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
            x += el.offsetLeft - el.scrollLeft;
            y += el.offsetTop - el.scrollTop;
            el = el.offsetParent;
        }

        x = ev.clientX - x + document.documentElement.scrollLeft;
        y = ev.clientY - y + document.documentElement.scrollTop;

        return { x: x, y: y };
    }

    //Zoom control
    function mousewheel(ev) {
        var displacement = ("wheelDelta" in ev)?ev.wheelDelta:ev.detail;
        var zoom = that.viewportZoom;

        zoom = zoom + ((displacement > 0)?0.10:-0.10);
        zoom = Math.min(Math.max(0.20, zoom), 4);
        that.setZoom(zoom);
        ev.preventDefault();
    }
    controllerElement.addEventListener('mousewheel', mousewheel); //Webkit
    controllerElement.addEventListener('DOMMouseScroll', mousewheel); //FF

    //Click controls
    controllerElement.addEventListener('mousedown', function mousedown(ev) {
        that.isDragging = true;

        var offset = getOffset(ev),
            sizeFactor =  that.cellSize * that.viewportZoom,
            cellX = Math.floor( offset.x / sizeFactor) + that.viewportStart.x ,
            cellY = Math.floor( offset.y / sizeFactor) + that.viewportStart.y ;

        that.lastCell= {x: cellX, y: cellY};

        if (!ev.shiftKey) {
            that.trigger("draw", that.lastCell);
        }

        ev.preventDefault();
    });
    controllerElement.addEventListener('mouseup', function (ev) {
        that.isDragging = false;
        ev.preventDefault();
    });
    controllerElement.addEventListener('mousemove', function (ev) {
        if (!that.isDragging) return;

        var offset = getOffset(ev),
            sizeFactor =  that.cellSize * that.viewportZoom,
            x = Math.floor( offset.x / sizeFactor) + that.viewportStart.x ,
            y = Math.floor( offset.y / sizeFactor) + that.viewportStart.y ,
            deltaX = that.lastCell.x - x,
            deltaY = that.lastCell.y - y;

        if ( deltaX || deltaY) {
            if (ev.shiftKey) {
                that.setStart({x: that.viewportStart.x + deltaX , y: that.viewportStart.y + deltaY});
            } else {
                that.lastCell= {x: x, y: y};
                that.trigger("draw", that.lastCell);
            }
        }

        ev.preventDefault();
    });
}

WireWorld.GridController.prototype.setZoom = function(zoom){
    this.viewportZoom = zoom;
    this.gridLayer.setZoom(zoom);
    this.cellLayer.clear();
    this.cellLayer.setZoom(zoom);
}

WireWorld.GridController.prototype.setStart = function(start){
    this.viewportStart = start;
    this.gridLayer.alignTo(start);
    this.cellLayer.clear();
    this.cellLayer.alignTo(start);
}

WireWorld.GridController.prototype.updateCells = function(cellMap, states) {
    var w = cellMap.w;
    var h = cellMap.h;
    var currentCells = cellMap.cells;
    var states = states;
    var cells = this.cellLayer.cells;

    for (var i = 0, len = currentCells.length; i<len; i++) {
        var x = i%w;
        var y = (i-x)/w;
        var cell = currentCells[i];

        if (cell.nextState && cell.nextState!=cell.state){
            cell.state=cell.nextState;
            delete cell.nextState;
        }

        cells[i].color = states[cell.state];
    }
}

WireWorld.GridController.prototype.refresh = function() {
    this.cellLayer.render();
}


//Attach event properties
asEvented.call(WireWorld.GridController.prototype);



