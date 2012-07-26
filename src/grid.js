ns("WireWorld");

WireWorld.Grid= function (obj){
    if (typeof obj != "object" || !obj) throw new Error("Config object not found");

    this.canvas = document.getElementById(obj.canvasId);
    this.range = document.getElementById(obj.rangeId);
    this.ctx = this.canvas.getContext("2d");
    this.callback = obj.callback;

    /**
     * Reference to the last clicked cell
     * @type {Object}
     */
    this.lastCell={};
    var that = this;
    this.canvas.addEventListener('mousedown', function mousedown(ev) {
        that.lastCell.x = Math.floor(ev.offsetX / that.cellSize);
        that.lastCell.y = Math.floor(ev.offsetY / that.cellSize);
        that.isDragging = true;
        that.notify();

        ev.preventDefault();
    });
    this.canvas.addEventListener('mouseup', function (ev) {
        that.isDragging = false;
        ev.preventDefault();
    });
    this.canvas.addEventListener('mousemove', function (ev) {
        if (!that.isDragging) return;

        var x = Math.floor(ev.offsetX / that.cellSize);
        var y = Math.floor(ev.offsetY / that.cellSize);

        if (x !== that.lastCell.x || y !== that.lastCell.y) {
            that.lastCell.x = x;
            that.lastCell.y = y;
            that.notify();
        }

        ev.preventDefault();
    });

    this.range.addEventListener('change', function () {
        that.cellSize = that.range.value;
        that.callback('zoom');
    });
}

WireWorld.Grid.prototype.bgColor = "rgba(0, 0, 0, 1)";
WireWorld.Grid.prototype.gridColor = "rgba(128, 128, 128, 0.5)";
WireWorld.Grid.prototype.cellSize = 10;
WireWorld.Grid.prototype.width = 805;
WireWorld.Grid.prototype.height = 605;

WireWorld.Grid.prototype.renderGrid = function() {
    if (this.cellSize == 1) {
        return;
    }
    //Compute some vars
    var height = this.height;
    var width = this.width;

    //Render background
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0,0, width, height);

    //Render grid
    var step = this.cellSize;
    var XSteps = Math.floor(width/step);
    var YSteps = Math.floor(height/step);
    this.ctx.fillStyle = this.gridColor;
    for (var i = 0, len=XSteps; i<len; i++) {
        var pos = i *step;
        this.ctx.fillRect(pos, 0, 1, height);
    }
    for (var i = 0, len=YSteps; i<len; i++) {
        var pos = i *step;
        this.ctx.fillRect(0, pos, width,1);
    }
}

WireWorld.Grid.prototype.renderCells = function(cells){
    for (var i = 0, len=cells.length; i<len; i++) {
        this.renderCell(cells[i]);
    }
}

WireWorld.Grid.prototype.renderCell = function(cell) {
    //+-1 is used to avoid overlap with the cell border

    var correction = !!(this.cellSize > 1);

    var color = cell.color;
    var x = cell.x * this.cellSize + correction;
    var y = cell.y * this.cellSize + correction;
    var w = this.cellSize - correction;
    var h = this.cellSize - correction;

    this.ctx.fillStyle=color;
    this.ctx.fillRect(x,y,w,h);
}


/**
 * Notify the map about a click event
 *
 * @todo very simple implementation, improve *
 */
WireWorld.Grid.prototype.notify = function() {
    this.callback("cell",this.lastCell);
}
