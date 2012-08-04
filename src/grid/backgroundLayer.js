/*
 * Copyright (C) 2012 WireWorld
 * License: http://www.gnu.org/licenses/agpl-3.0.html AGPL version 3 or higher
 *
 * @author Sergio Cinos <sergio.cinos@gmail.com>
 */

ns("WireWorld.Grid");

/**
 * WireWorld.Grid.BackgroundLayer class.
 *
 * It renders the background using a DIV
 */
WireWorld.Grid.BackgroundLayer = function(){}
WireWorld.Grid.BackgroundLayer.prototype = new WireWorld.Grid.Layer();

/**
 * Create the canvas element used to render the grid
 * @return {Element}
 * @private
 */
WireWorld.Grid.BackgroundLayer.prototype._createDOMLayer = function() {
    var canvas = document.createElement('div');
    canvas.className= this.cfg.cls;
    return canvas;
}