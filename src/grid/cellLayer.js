/*
 * Copyright (C) 2012 WireWorld
 * License: http://www.gnu.org/licenses/agpl-3.0.html AGPL version 3 or higher
 *
 * @author Sergio Cinos <sergio.cinos@gmail.com>
 */

ns("WireWorld.Grid");

/**
 * WireWorld.Grid.CellLayer class.
 * It renders the cells
 */
WireWorld.Grid.CellLayer = function(){}
WireWorld.Grid.CellLayer.prototype = new WireWorld.Grid.CanvasLayer();

/**
 * Initializes the object.
 */
WireWorld.Grid.CellLayer.prototype.init = function (obj){
    WireWorld.Grid.CanvasLayer.prototype.init.call(this, obj);

    this.cells = [];
    for (var i = 0, len = this.cfg.maxSize.x * this.cfg.maxSize.y; i < len; i++) {
        this.cells[i] = {color: this.cfg.defaultColor}
    }
}

/**
 * Renders the cells
 */
WireWorld.Grid.CellLayer.prototype.render = function render(){
    var step = this.cfg.cellSize * this.cfg.viewportZoom,
        lastVisibleCellX = this.cfg.width / step,
        lastVisibleCellY = this.cfg.height / step,
        firstVisibleCellX = this.cfg.viewportStart.x,
        firstVisibleCellY = this.cfg.viewportStart.y,
        width = this.cfg.maxSize.x,
        cells = this.cells,
        coloredCells = {},
        colors = this.cfg.colors,
        ctx = this._ctx;

    //Create empty map using color as key
    for (var i = 0, len=colors.length; i<len; i++) {
        coloredCells[colors[i]]=[];
    }

    //Create map based on color
    for (var i = 0, len=cells.length; i<len; i++) {
        var cell = cells[i];

        //Skip iteration if the color is the same
        if (!cell.oldColor && cell.color == cell.oldColor) continue;

        //Get cell coordinates
        var cellX = i % width;
        var cellY = (i - cellX) / width;

        //Skip cells outside visible range
        if ( cellX < firstVisibleCellX || cellX > (firstVisibleCellX+lastVisibleCellX) ||
             cellY < firstVisibleCellY || cellY > (firstVisibleCellY+lastVisibleCellY) ) continue;

        //Finally, save the colored cell
        coloredCells[cell.color].push([step*(cellX-firstVisibleCellX), step*(cellY-firstVisibleCellY), step]);
        cell.oldColor = cell.color;
    }

    //Render colored cells
    for (var color in coloredCells) {
        ctx.fillStyle=color;
        for (var i= 0, len = coloredCells[color].length; i<len; i++) {
            var cell = coloredCells[color][i];
            ctx.fillRect(cell[0], cell[1], cell[2], cell[2]);
        }
    }
}

/**
 * Clears the canvas and reset internal data about cells color
 */
WireWorld.Grid.CellLayer.prototype.clear = function() {
    WireWorld.Grid.CanvasLayer.prototype.clear.call(this);

    for (var i = 0, len = this.cfg.maxSize.x * this.cfg.maxSize.y; i < len; i++) {
        this.cells[i].oldColor='';
    }
}
