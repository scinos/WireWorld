/*
 * Copyright (C) 2012 WireWorld
 * License: http://www.gnu.org/licenses/agpl-3.0.html AGPL version 3 or higher
 *
 * @author Sergio Cinos <sergio.cinos@gmail.com>
 */

ns("WireWorld.Grid");

/**
 * WireWorld.Grid.Layer class.
 * Base Layer.
 */
WireWorld.Grid.Layer= function(){
}

/**
 * Initializes the object.
 */
WireWorld.Grid.Layer.prototype.init = function(obj){
    //Save config
    this.cfg = obj;

    //Create layer and inject into the DOM
    this._dom = this._createDOMLayer();
    this._injectIntoDOM(this._dom);
}

/**
 * Injects an element into the grid container
 * @param element {Element} Element to insert
 * @private
 */
WireWorld.Grid.Layer.prototype._injectIntoDOM= function(element) {
    var container = this.cfg.container;
    container.appendChild(element);
}