/*
 * Copyright (C) 2012 WireWorld
 * License: http://www.gnu.org/licenses/agpl-3.0.html AGPL version 3 or higher
 *
 * @author Sergio Cinos <sergio.cinos@gmail.com>
*/

ns("WireWorld.Grid");

/**
 * WireWorld.Grid.GridLayer class.
 * It renders the grids lines
 */
WireWorld.Grid.GridLayer = function(){}
WireWorld.Grid.GridLayer.prototype = new WireWorld.Grid.CanvasLayer();

/**
 * Renders the grid lines.
 *
 * This function clears the canvas before rendering.
 */
WireWorld.Grid.GridLayer.prototype.render = function() {
    var size= this.cfg.cellSize * this.cfg.viewportZoom,
        ctx = this._ctx,
        color = this.cfg.color,
        correction = 0.5, //Makes likes look better, thanks to http://stackoverflow.com/a/11798652/162719

        offsetX = -this.cfg.viewportStart.x * size,
        offsetY = -this.cfg.viewportStart.y * size,
        maxX = (this.cfg.maxSize.x * size) + offsetX,
        maxY = (this.cfg.maxSize.y * size) + offsetY,

        width = Math.min(this.cfg.width, maxX),
        height = Math.min(this.cfg.height, maxY);


    this.clear();

    ctx.strokeStyle = color;
    ctx.beginPath();
    for (var x=offsetX; x <= maxX; x += size){
        ctx.moveTo(x+correction, offsetY);
        ctx.lineTo(x+correction, height);
    }
    for (var y=offsetY; y<= maxY; y+=size){
        ctx.moveTo(offsetX, y+correction);
        ctx.lineTo(width,   y+correction);
    }
    ctx.stroke();
}
