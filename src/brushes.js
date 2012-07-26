ns("WireWorld");

WireWorld.Brushes= function (obj){
    if (typeof obj != "object" || !obj) throw new Error("Config object not found");

    this.brushes = document.getElementById(obj.brushesId);

    var that = this;
    this.brushes.addEventListener('click', function(ev){
        that.currentBrush = ev.target.getAttribute("data-brush");
    });


    this.cursorGrid = new WireWorld.Grid({
        canvasId: 'cursor',
        rangeId: 'zoom'
    })
    this.cursorGrid.width = 100;
    this.cursorGrid.height = 50;
    this.cursorGrid.renderGrid();


    this.cursorGrid.
    this.cursorCanvas = document.getElementById("cursor");
    this.cursorCanvas.ctx = this.cursorCanvas.getContext("2d");


}

