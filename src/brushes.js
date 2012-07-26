ns("WireWorld");

WireWorld.Brushes= function (obj){
    if (typeof obj != "object" || !obj) throw new Error("Config object not found");

    this.brushes = document.getElementById(obj.brushesId);

    var that = this;
    this.brushes.addEventListener('click', function(ev){
        that.currentBrush = ev.target.getAttribute("data-brush");
    });
}

