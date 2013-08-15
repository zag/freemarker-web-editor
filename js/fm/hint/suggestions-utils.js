define([ "dojo/_base/declare", "dojo/_base/array", "dojo/_base/lang", "./suggestion-def", "./token-utils", "./suggestion" ], function (declare, dojoArray, dojoLang) {

    var SuggestionUtils = declare("SuggestionUtils", null, {});

    SuggestionUtils.createSuggestionArray = function (arrStrings, curStart, curEnd) {
        if (curEnd === undefined) {
            curEnd = curStart;
        }

        var suggestionArr = [];
        dojoArray.forEach(arrStrings, function (v) {
            var suggestion = TokenUtils.TOKENS[v];
            if (suggestion !== undefined) {
                if (!suggestion.getHide()) {
                    var suggestionValues = suggestion.translate();
                    dojoArray.forEach(suggestionValues, function (singleValue) {
                        var entry = new Suggestion(singleValue, curStart, curEnd);
                        entry.setPriority(suggestion.getPriority());
                        suggestionArr.push(entry);
                    });
                }
            }
            // Normal text suggestions
            else {
                var entry = new Suggestion(v, curStart, curEnd);
                suggestionArr.push(entry);
            }
        });
        return suggestionArr;
    };

    SuggestionUtils.filterSuggestionsArray = function (suggestionArray, filterText) {
        filterText = dojoLang.trim(filterText);
        var filteredSuggestions = [];
        dojoArray.forEach(suggestionArray, function (n) {
            if (n.getText().indexOf(filterText) == 0 && n.getText() != filterText) {
                filteredSuggestions.push(n);
            }
        });
        return filteredSuggestions;
    }

    SuggestionUtils.sortSuggestionsArray = function (suggestionArray) {
        var uniqueNames = [];
        var prioritized = {};
        prioritized[SuggestionDef.PRIORITY.LOW] = [];
        prioritized[SuggestionDef.PRIORITY.HIGH] = [];

        dojoArray.forEach(suggestionArray, function (n) {
            if (dojoArray.indexOf(uniqueNames, n.getText()) == -1) {
                prioritized[n.getPriority()].push(n);
                uniqueNames.push(n.getText());
            }
        });

        var sorted = [];
        prioritized[SuggestionDef.PRIORITY.LOW].sort(Suggestion.comparator);
        prioritized[SuggestionDef.PRIORITY.HIGH].sort(Suggestion.comparator);
        sorted = sorted.concat(prioritized[SuggestionDef.PRIORITY.HIGH]);
        sorted = sorted.concat(prioritized[SuggestionDef.PRIORITY.LOW]);
        return sorted;
    }

    return SuggestionUtils;
});
