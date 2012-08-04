/*
 * Copyright (C) 2012 WireWorld
 * License: http://www.gnu.org/licenses/agpl-3.0.html AGPL version 3 or higher
 *
 * @author Sergio Cinos <sergio.cinos@gmail.com>
*/

ns("WireWorld.Grid");

/**
 * WireWorld.Grid.CanvasLayer class.
 * Base class for all <canvas> related layers
 */
WireWorld.Grid.CanvasLayer = function(){}
WireWorld.Grid.CanvasLayer.prototype = new WireWorld.Grid.Layer();

/**
 * Initializes the object.
 * It creates the canvas element and injects into the DOM
 */
WireWorld.Grid.CanvasLayer.prototype.init = function(obj){
    WireWorld.Grid.Layer.prototype.init.call(this,obj);

    //Save 2d-context
    this._ctx = this._dom.getContext("2d");
}

/**
 * Create the canvas element used to render the grid
 * @return {Element}
 * @private
 */
WireWorld.Grid.CanvasLayer.prototype._createDOMLayer = function() {
    var canvas = document.createElement('canvas');
    canvas.className= this.cfg.cls;
    canvas.height = this.cfg.height;
    canvas.width = this.cfg.width;
    return canvas;
}

/**
 * Sets the cell to align in the top-left corner.
 *
 * @param start {Object} Object like {x:<num>,y:<num>}.
 */
WireWorld.Grid.CanvasLayer.prototype.alignTo = function(start) {

    if (this.cfg.viewportStart !== start) {
        this.cfg.viewportStart = start;
        this.render();
    }
}

/**
 * Sets the zoom level used. 1 for no zoom, bigger vales mean bigger cells.
 * @param newZoom {Number} Zoom level to use.
 */
WireWorld.Grid.CanvasLayer.prototype.setZoom = function(newZoom) {
    if (this.cfg.viewportZoom !== newZoom) {
        this.cfg.viewportZoom = newZoom;
        this.render();
    }
}

/**
 * Clears the canvas
 */
WireWorld.Grid.CanvasLayer.prototype.clear = function() {
    var w = this.cfg.width,
        h = this.cfg.height,
        ctx = this._ctx;

    ctx.clearRect ( 0 , 0 , w , h );
}
