ns("WireWorld");

WireWorld.MCell = {}

WireWorld.MCell.encode = function (input, w, h) {

    function insertLineSeparators() {
        for (var i = w; i<=w*h; i+=w ) {
            //Any multiple of w (w, w+w, w+w+w...) is the character of a new line,
            //so we insert a $ before that character (i-1)
            input = input.slice(0,i-1) + "$" + input.slice(i);
        }
    }
    function removeTrailingDots() {
        input = input.replace(/\.+\$/g, "$");
    }
    function shortenRepeatedStrings() {
        //Replace long strings of repeated characters with <count><character>
        //Example: CCCC -> 4C
        function compress(prefix){
            return function(match) {
                return match.length + prefix;
            };
        }
        input = input.
            replace(/\.{2,}/g, compress(".")).
            replace(/C{2,}/g, compress("C")).
            replace(/H{2,}/g, compress("H")).
            replace(/T{2,}/g, compress("T"));
    }
    function removeTrailingBlankLines() {
        //Remove trailing blank lines
        input = input.replace(/\$+$/,"$");
    }

    insertLineSeparators();
    removeTrailingDots();
    shortenRepeatedStrings();
    removeTrailingBlankLines();

    //Compose final result (input + headers)
    var result = [
        "#MCell 4.00",
        "#GAME Wireworld",
        "#BOARD "+w+"x"+h
    ];

    for (var i = 0, len = input.length; i<=len; i+=64) {
        result.push("#L "+ input.substr(i,64));
    }

    return result.join("\n");
}

WireWorld.MCell.decode = function (encodedString) {
    //Extract size
    var sizes = encodedString.match(/#BOARD (\d+)x(\d+)/);
    var width = sizes[1];
    var height = sizes[2];

    //Extract pattern
    var re = /#L (.+)/g;
    var result;
    var pattern = "";
    while(result = re.exec(encodedString)) {
        pattern += result[1];
    }

    function addMissingBlankLines() {
        //Add missing blank lines
        var currentBlankLines = pattern.split('$').length - 1;
        var neededBlankLines = Array( height - currentBlankLines + 1).join("$");
        pattern = pattern + neededBlankLines;
    }
    function expandRepeatedStrings() {
        //Expand repeated strings
        function expand(prefix){
            return function(match, group) {
                return Array(+group + 1).join(prefix);
            };
        }
        pattern = pattern.
            replace(/(\d+)\./g,expand(".")).
            replace(/(\d+)H/g, expand("H")).
            replace(/(\d+)C/g, expand("C")).
            replace(/(\d+)T/g, expand("T"))
    }
    function expandTrailingDots() {
        //Expand trailing dots (skip the last line, it is the trailing $)
        var lines = pattern.split('$');
        for (var i = 0, len = lines.length; i<len-1; i++) {
            var lineLength = lines[i].length;
            var expandedDots = Array( width - lineLength +1 ).join(".");
            lines[i] = lines[i] + expandedDots;
        }
        pattern = lines.join("$");
    }
    function removeNewlineMarks() {
        pattern = pattern.replace(/\$/g,"");
    }

    addMissingBlankLines();
    expandRepeatedStrings();
    expandTrailingDots();
    removeNewlineMarks();

    return pattern;
}

