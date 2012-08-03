ns("WireWorld");

WireWorld.Grid= function (obj){
    /**
     * Reference to the last clicked cell
     * @type {Object}
     */
    this.lastCell={};

    //Capture some vars
    var that = this;
    var canvas  = document.getElementById(obj.canvasId);
    this.bgColor = obj.bgColor;
    this.gridColor = obj.gridColor;
    this.cellSize = obj.cellSize;

    //Compute height & width
    this.ctx = canvas.getContext("2d");
    this.height = canvas.height;
    this.width = canvas.width;

    //Zoom control
    function mousewheel(ev) {
        var displacement = ("wheelDelta" in ev)?ev.wheelDelta:ev.detail;
        if (displacement > 0) {
            that.viewportZoom = Math.min ( Math.max(0.20, that.viewportZoom + 0.10), 4);
        } else {
            that.viewportZoom = Math.min ( Math.max(0.20, that.viewportZoom - 0.10), 4);
        }
        that.trigger("zoom", that.viewportZoom);
        ev.preventDefault();
    }
    canvas.addEventListener('mousewheel', mousewheel); //Webkit
    canvas.addEventListener('DOMMouseScroll', mousewheel); //FF

    //Click controls
    canvas.addEventListener('mousedown', function mousedown(ev) {
        that.isDragging = true;

        if (ev.shiftKey) {
            that.lastCell.x = Math.floor( (ev.clientX -  ev.target.offsetLeft) / that.cellSize / that.viewportZoom);
            that.lastCell.y = Math.floor( (ev.clientY -  ev.target.offsetTop) / that.cellSize / that.viewportZoom);
        } else {
            that.lastCell.x = Math.floor( (ev.clientX -  ev.target.offsetLeft) / that.cellSize / that.viewportZoom);
            that.lastCell.y = Math.floor( (ev.clientY -  ev.target.offsetTop) / that.cellSize / that.viewportZoom);
            that.trigger("draw", that.lastCell);
        }
        ev.preventDefault();
    });
    canvas.addEventListener('mouseup', function (ev) {
        that.isDragging = false;
        ev.preventDefault();
    });
    canvas.addEventListener('mousemove', function (ev) {
        if (!that.isDragging) return;

        if (ev.shiftKey) {
            var x = Math.floor( (ev.clientX -  ev.target.offsetLeft) / that.cellSize / that.viewportZoom);
            var y = Math.floor( (ev.clientY -  ev.target.offsetTop) / that.cellSize / that.viewportZoom);

            var deltaX = that.lastCell.x-x;
            var deltaY = that.lastCell.y-y;

            if ( deltaX || deltaY) {
                that.lastCell.x = x;
                that.lastCell.y = y;
                that.trigger("move", that.viewportStart.x + deltaX, that.viewportStart.y + deltaY);
            }

        } else {
            var x = Math.floor( (ev.clientX -  ev.target.offsetLeft) / that.cellSize / that.viewportZoom);
            var y = Math.floor( (ev.clientY -  ev.target.offsetTop) / that.cellSize / that.viewportZoom);
            if (x !== that.lastCell.x || y !== that.lastCell.y) {
                that.lastCell.x = x;
                that.lastCell.y = y;
                that.trigger("draw", that.lastCell);
            }

        }

        ev.preventDefault();
    });
}

WireWorld.Grid.prototype.renderBackground = function() {
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0,0, this.width, this.height);
}
WireWorld.Grid.prototype.renderCells = function(){
    var step = this.cellSize * this.viewportZoom;
    var cellWidth = Math.floor(this.width / step);
    var cellHeight = Math.floor(this.height / step);
    var start = this.viewportStart;
    var cells = this.cells;

    this.ctx.strokeStyle=this.gridColor;
    for (var i = 0, len=cells.length; i<len; i++) {
        var cell = cells[i];

        if (cell.x >= start.x && cell.x <= (start.x+cellWidth) &&
            cell.y >= start.y && cell.y <= (start.y+cellHeight)
            ) {

            var x = step*(cell.x-start.x);
            var y = step*(cell.y-start.y);
            var w = step;
            var h = step;

            this.ctx.fillStyle=cell.color;
            this.ctx.fillRect(x,y,w,h);
            this.ctx.strokeRect(x,y,w,h);
        }
    }
}
WireWorld.Grid.prototype.update = function() {
    this.renderBackground();
    this.renderCells();
}

WireWorld.Grid.prototype.setZoom = function(zoom){
    this.viewportZoom = zoom;
}
WireWorld.Grid.prototype.setStart = function(start){
    this.viewportStart = start;
}
WireWorld.Grid.prototype.setCells = function(cells){
    this.cells = cells;
}
WireWorld.Grid.prototype.setMax = function(max){
    this.max = max;
}

//Attach event properties
asEvented.call(WireWorld.Grid.prototype);