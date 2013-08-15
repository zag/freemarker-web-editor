define([ "dojo/_base/declare", "dojo/_base/array", "./modeState" ], function (declare, dojoArray) {

    // Static variables used for caching the previous lexerConnector (with its tokens)
    // for when the editor calls the lexer repeatedly for the same line - as it does
    // from fm-matchbrackets.js (due to my code changes).
    ModeState.PreviousTokenizedLine = null;
    ModeState.PreviousLexerConnector = null;

    CodeMirror.defineMode("freemarker", function (config, parserConfig) {
        "use strict";
        return {
            findTokenByOffset: function (offset, list) {
                var foundToken = null;
                dojoArray.some(list, function (node, i) {
                    if (node.matchesOffset(offset)) {
                        foundToken = node;
                        return true;
                    }

                    return false;
                });
                return foundToken;
            },
            startState: function () {
                return new ModeState();
            },
            blankLine: function (state) {
                ++state.lastIndexInCode;
            },
            electricChars: ">",
            indentRegexps: [/<#[^-].+[^/]>/g],
            electricRegexp: [/<#else(if)?/g],
            dedentRegexps: [/<\/#.+>/g, /<#else(if)?/g],
            indent: function (state, textAfter) {
                var cm = parserConfig.fmEditor.codeMirror;
                var indentUnit = cm.getOption("indentUnit");

                state.indent += state.nextLineIndentChange;
                dojoArray.forEach(this.dedentRegexps, function (n) {
                    var matches = textAfter.match(n);
                    if (matches !== null) {
                        state.indent -= matches.length;
                    }
                });

                var indent = (state.indent < 0) ? 0 : state.indent;
                return indent * indentUnit;
            },
            getIndentChange: function (line) {
                var indentChange = 0;
                dojoArray.forEach(this.indentRegexps, function (n) {
                    var matches = line.match(n);
                    if (matches !== null) {
                        indentChange += matches.length;
                    }
                });

                dojoArray.forEach(this.dedentRegexps, function (n) {
                    var matches = line.match(n);
                    if (matches !== null) {
                        indentChange -= matches.length;
                    }
                });

                return indentChange;
            },
            copyState: function (state) {
                return state.cloneForToken();
            },
            token: function (stream, state) {
                var fmEditor = parserConfig.fmEditor;

                if (stream.sol()) {
                    // For dealing with '\n's
                    if (state.newLine) {
                        ++state.lastIndexInCode;
                        state.newLine = false;
                    }
                    state.indexInLine = 0;

                    // Don't parse again if we already have the lexerConnector for the same line.
                    if (ModeState.PreviousTokenizedLine != stream.string) {
                        fmEditor.lex(stream.string, state.lexerConnector);
                        state.indent += state.nextLineIndentChange;
                        state.nextLineIndentChange = this.getIndentChange(stream.string);
                        ModeState.PreviousLexerConnector = state.getLexerConnector();
                        ModeState.PreviousTokenizedLine = stream.string;
                    }
                    else {
                        state.lexerConnector = ModeState.PreviousLexerConnector;
                    }
                }

                var foundToken = this.findTokenByOffset(state.indexInLine, state.lexerConnector.getTokens());

                if (foundToken == null) {
                    state.increaseIndexInLine();
                    stream.next();
                    return "NOT-FOUND";
                }

                var paintLength = foundToken.stop - foundToken.start + 1;
                for (var consumeIndex = 0; consumeIndex < paintLength; ++consumeIndex) {
                    state.increaseIndexInLine();
                    stream.next();
                }

                // Just in case...
                if (paintLength <= 0) {
                    state.increaseIndexInLine();
                    stream.next();
                    return "ANY_CHAR";
                }

                if (stream.eol()) {
                    state.newLine = true;
                }

                return foundToken.type;
            }
        };
    });
});