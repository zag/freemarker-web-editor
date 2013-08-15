define([ "dojo/_base/declare", "./suggestion-def" ], function (declare) {
    var Suggestion = declare("Suggestion", null, {
        clickable: true,
        selected: false,
        priority: null,
        text: null,
        from: null,
        to: null,
        constructor: function (text, curStart, curEnd) {
            this.text = text;
            this.priority = SuggestionDef.PRIORITY.HIGH;
            this.from = curStart;
            if (curEnd === undefined) {
                curEnd = curStart;
            }

            this.to = curEnd;
        },
        getSelected: function () {
            return this.selected;
        },
        setPriority: function (priority) {
            this.priority = priority;
        },
        getPriority: function () {
            return this.priority;
        },
        setSelected: function (selected) {
            this.selected = selected;
        },
        isClickable: function () {
            return this.clickable;
        },
        setClickable: function (clickable) {
            this.clickable = clickable;
        },
        getText: function () {
            return this.text;
        },
        getFrom: function () {
            return this.from;
        },
        getTo: function () {
            return this.to;
        }
    });
    Suggestion.comparator = function (a, b) {
        var aText = a.getText();
        var bText = b.getText();
        return (aText == bText) ? 0 : (aText > bText) ? 1 : -1;
    }
});