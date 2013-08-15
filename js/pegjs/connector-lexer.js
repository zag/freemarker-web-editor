define([ "dojo/_base/declare", "dojo/_base/array" ], function (declare, dojoArray) {
    var LexerConnector = declare("LexerConnector", null, {
        constructor: function () {
            this.currStack = [];
            // output variable
            this.tokens = null;
        },
        clone: function () {
            // cloning only input variables.
            var newState = new LexerConnector();
            newState.currStack = [];
            dojoArray.forEach(this.currStack, function (n) {
                newState.currStack.push(n.clone());
            });
            return newState;
        },
        setTokens: function (tokens) {
            this.tokens = tokens;
        },
        getTokens: function () {
            return this.tokens;
        },
        pushState: function (newState) {
            var clonedState = newState.clone();
            this.currStack.push(clonedState);
        },
        popState: function (expectedPop) {
            var popped = this.currStack.pop();

            if (expectedPop.id == popped.id) {
                // popped state ok
            }
            else if (expectedPop.id == popped.superState.id) {
                var stackTop = this.peekState();
                // superstates have themselves as the superstate
                while (stackTop.superState.id == expectedPop.id) {
                    this.currStack.pop();
                    stackTop = this.peekState();
                }
            }
            else {
                console.log("something's wrong: popped state " + popped + ", while " + expectedPop + " was expected"); // TEMP
            }
        },
        peekState: function () {
            return this.currStack[this.currStack.length - 1];
        },
        checkState: function (state) {
            var check = false;
            if (this.currStack.length) {
                check = state.id == this.currStack[this.currStack.length - 1].id;
            }
            return check;
        },
        checkSuperState: function (state) {
            var peek = this.peekState();
            while (true) {
                if (peek.id == state.id) {
                    return true;
                }
                else if (peek.id != peek.superState.id) {
                    peek = peek.superState;
                }
                else {
                    return false;
                }
            }
        },
        getStateStack: function () {
            return this.currStack;
        }
    });
});
