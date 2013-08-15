define([ "dojo/_base/declare", "dojo/_base/array" ], function (declare, dojoArray) {
    var SuggestionDef = declare("SuggestionDef", null, {
        name: null,
        hide: false,
        priority: null,
        constructor: function (name, trans) {
            this.translateValues = [];
            this.priority = SuggestionDef.PRIORITY.HIGH;
            this.name = name;
            if (typeof trans == "string") {
                this.translateValues.push(trans);
            }
            else {
                this.translateValues = trans;
            }
        },
        setPriority: function (priority) {
            this.priority = priority;
        },
        getPriority: function () {
            return this.priority;
        },
        getHide: function () {
            return this.hide;
        },
        getName: function () {
            return this.name;
        },
        translate: function () {
            return this.translateValues;
        }
    });
    SuggestionDef.PRIORITY = {};
    SuggestionDef.PRIORITY.LOW = 0;
    SuggestionDef.PRIORITY.HIGH = 1;

    var SuggestionDefHidden = declare("SuggestionDefHidden", SuggestionDef, {
        constructor: function (name, trans, hide) {
            this.hide = true;
        }
    });
    var SuggestionDefLow = declare("SuggestionDefLow", SuggestionDef, {
        constructor: function (name, trans, hide) {
            this.priority = SuggestionDef.PRIORITY.LOW;
        }
    });

    var SuggestionDefHigh = declare("SuggestionDefHigh", SuggestionDef, {
        constructor: function (name, trans, hide) {
            this.priority = SuggestionDef.PRIORITY.HIGH;
        }
    });
});
