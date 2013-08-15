define([ "dojo/_base/declare" ], function (declare) {
    var ModeState = declare("ModeState", null, {
        constructor: function () {
            this.lexerConnector = new LexerConnector();
            this.indent = 0;
            this.nextLineIndentChange = 0;
            this.lastIndexInCode = 0;
            this.indexInLine = 0;
            this.newLine = false;
        },
        getIndexInLine: function () {
            return this.indexInLine;
        },
        increaseIndexInLine: function () {
            ++this.indexInLine;
            ++this.lastIndexInCode;
        },
        getLastIndexInCode: function () {
            return this.lastIndexInCode;
        },
        getLexerConnector: function () {
            return this.lexerConnector;
        },
        cloneForToken: function () {
            var newState = new ModeState();
            newState.indexInLine = this.indexInLine;
            newState.lastIndexInCode = this.lastIndexInCode;
            newState.newLine = this.newLine;
            newState.indent = this.indent;
            newState.nextLineIndentChange = this.nextLineIndentChange;
            newState.lexerConnector = this.lexerConnector.clone();
            return newState;
        }
    });
});