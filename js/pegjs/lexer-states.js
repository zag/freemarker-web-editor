define([ "dojo/_base/declare" ], function (declare) {
    var State = declare("State", null, {
        constructor: function (id, superState) {
            this.id = id;
            if (typeof superState != "undefined") {
                this.superState = superState;
            }
            else {
                this.superState = this;
            }
        },
        clone: function () {
            var newState = new State(this.id, this.superState);

            // additional members can be added to states
            for (var key in this) {
                newState[key] = this[key];
            }

            return newState;
        }
    });

    // states in order
    State.STATE_PCDATA = new State(0);
    State.STATE_COMMENT = new State(1);
    State.STATE_TAG = new State(2);
    State.STATE_PAREN = new State(20, State.STATE_TAG);
    State.STATE_BRACKET = new State(21, State.STATE_TAG);
    State.STATE_BRACE = new State(22, State.STATE_TAG);
    State.STATE_STRING = new State(23, State.STATE_TAG);
    State.STATE_EXPRESSION = new State(24, State.STATE_TAG);
    State.STATE_CLOSE_TAG = new State(3);
});