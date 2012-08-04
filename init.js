function initAutomata(){

    var automata = new WireWorld.Automata({
        grid: new WireWorld.GridController({
            element: 'automata',
            width: 160,
            height: 120
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
    var data = "#MCell 4.00\n#GAME Wireworld\n#BOARD 160x120\n#L $$2.CTH18C6.TH$28.C2.C$12.11C6.2C.21C$2.CTH7C40.C$12.11C4.4C.C3.4C.4C.C2.C2.14C$27.C4.C3.C2.C.C4.C.C17.C$11.2C14.C4.C3.C2.C.C4.2C17.15C$2.CTH6C.11C4.C4.C3.C2.C.C4.C.C17.C$11.2C15.3C.3C.4C.4C.C2.C2.14C$52.C$11.2C15.3C.21C$2.CTH7C.10C4.C3.C23.4C.4C2.4C.4C.3C.4C$11.2C14.C3.C23.C2.C.C2.C2.C4.C2.C2.C2.C$27.C3.C23.C2.C.4C2.C.2C.4C2.C2.3C$28.HTC24.C2.C.C.C3.C2.C.C2.C2.C2.C$2.3C2.4C2.3C.C.4C32.4C.C2.C2.4C.C2.C2.C2.4C$2.C2.C.C2.C.C4.C.C$2.3C2.4C2.2C2.C.C$2.C2.C.C2.C4.C.C.C$2.3C2.C2.C.3C2.C.4C$$$$3.TH$2.C2.C$3.2C6.6C10.6C$5.C5.C5.C9.C5.C9.C2.C.4C.4C2.4C.4C.3C.4C$5.C5.C4.4C7.C4.4C7.C2.C.C2.C.C2.C2.C4.C2.C2.C2.C$5.7C4.C2.9C4.C2.6C3.2C2.C2.C.4C2.C.2C.4C2.C2.3C$5.C5.C4.4C7.C4.4C7.C2.C.C2.C.C.C3.C2.C.C2.C2.C2.C$5.C5.C5.C9.C5.C9.C2.C.4C.C2.C2.4C.C2.C2.C2.4C$5.C5.2C2.2C10.6C$5.C$5.C$5.C$5.C$5.C$5.C$5.C45.C2.C.4C.C2.C.3C$5.C45.2C.C.C2.C.2C.C.C2.C$5.C12.3C4.3C9.12C2.C.2C.4C.C.2C.C2.C$5.C12.C9.C.C6.C13.C2.C.C2.C.C2.C.C2.C$5.C12.C8.11C13.C2.C.C2.C.C2.C.3C$5.14C8.C2.C$18.C8.11C$18.C9.C8.C$18.10C9.12C2.4C.4C$51.C2.C.C2.C$51.C2.C.4C$51.C2.C.C.C$51.4C.C2.C$"
    automata.load(WireWorld.MCell.decode(data));

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