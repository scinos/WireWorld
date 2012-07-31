function initAutomata(){

    var automata = new WireWorld.Automata({
        grid: new WireWorld.Grid({
            canvasId: 'cnv',
            bgColor: "black",
            gridColor: "#444",
            cellSize: 10
        }),
        brushes: new WireWorld.Brushes({
            brushesId: "brushes"
        }),
        states: {
            "copper": "#804C00",
            "head": "red",
            "tail": "yellow",
            "blank": "black"
        },
        initialState: new WireWorld.CellMap(160, 120, "blank")
    });

    //Load circuit with demo-gates
    automata.load(WireWorld.MCell.decode("#MCell 4.00\n#GAME Wireworld\n#BOARD 160x120\n#L $$2.CTH18C6.TH21.14C$28.C2.C20.C13.C$12.11C6.2C.21C12.12C$2.CTH7C40.C13.C$12.11C29.14C$$11.2C15.3C$2.CTH6C.11C4.C3.T$11.2C14.H3.H20.14C$27.T3.C20.C13.C$11.2C15.3C.21C12.12C$2.CTH7C.10C29.C13.C$11.2C39.C2.11C$$$2.3C2.4C2.3C.C.4C4.4C.C4.4C.4C.C2.C9.4C.4C$2.C2.C.C2.C.C4.C.C7.C4.C4.C2.C.C4.C.C10.C2.C.C2.C$2.3C2.4C2.2C2.C.C7.C4.C4.C2.C.C4.2C11.C2.C.4C$2.C2.C.C2.C4.C.C.C7.C4.C4.C2.C.C4.C.C10.C2.C.C.C$2.3C2.C2.C.3C2.C.4C4.4C.4C.4C.4C.C2.C9.4C.C2.C$$$$3.TH$2.C2.C$3.2C6.6C10.6C$5.C5.C5.C9.C5.C9.C2.C.4C.4C$5.C5.C4.4C7.C4.4C7.C2.C.C2.C.C2.C$5.7C4.C2.9C4.C2.6C3.2C2.C2.C.4C$5.C5.C4.4C7.C4.4C7.C2.C.C2.C.C.C$5.C5.C5.C9.C5.C9.C2.C.4C.C2.C$5.C5.2C2.2C10.6C$5.C$5.C$5.C$5.C$5.C$5.C$5.C45.4C.C2.C.3C2.C2.C.4C.3C$5.C45.C2.C.C2.C.C2.C.2C.C.C2.C2.C$5.C12.3C4.3C9.12C2.4C.2C.C.C2.C.C.2C.C2.C2.C$5.C12.C9.C.C6.C13.C2.C.C.2C.C2.C.C2.C.C2.C2.C$5.C12.C8.11C13.C2.C.C2.C.3C2.C2.C.4C2.C$5.14C8.C2.C$18.C8.11C$18.C9.C8.C$18.10C9.12C2.4C.3C$51.C2.C.C2.C$51.C2.C.C2.C$51.C2.C.3C$51.C2.C.C.C$51.4C.C2.C$"))
    document.getElementById("pattern").value = WireWorld.MCell.encode(automata.save(), 160, 120);

    //Attach UI listeners
    document.getElementById("start").onclick=function(){
        automata.start();
    };
    document.getElementById("stop").onclick=function(){
        automata.stop();
    };
    document.getElementById("ff").onclick=function(){
        automata.nextStep();
    };
    document.getElementById("reset").onclick=function(){
        automata.reset();
    };
    document.getElementById("saveBtn").onclick=function() {
        document.getElementById("pattern").value = WireWorld.MCell.encode(automata.save(), 160, 120);
    };
    document.getElementById("loadBtn").onclick=function() {
        automata.load(WireWorld.MCell.decode(document.getElementById("pattern").value));
    };

    return automata;
}