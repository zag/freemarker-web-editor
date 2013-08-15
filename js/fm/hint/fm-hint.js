define([ "dojo/_base/declare", "dojo/_base/array", "./fm-hint-metadata", "./suggestions-utils", "../cm/cm-utils", "./token-utils", "./fm-hint-ui" ],
    function (declare, dojoArray, hintMetadata, SuggestionUtils, CodeMirrorUtils, TokenUtils) {

        var SuggestionContext = declare("SuggestionContext", null, {
                token: null,
                handler: null,
                constructor: function (handler) {
                    this.handler = handler;
                    this.token = handler.getEditor().getTokenAt(handler.getCursorFrom());
                },
                callContextGenerate: function (className) {
                    var context = new className(this.handler);
                    return context.generate();
                },
                getExpected: function () {
                    var expected = [];
                    var parseException = this.handler.getParseException();
                    if (parseException != null) {
                        expected = parseException.getExpected();
                    }
                    return expected;
                },
                getToken: function () {
                    return this.token;
                },
                condition: function () {
                    // Overridden
                    return false;
                },
                generate: function () {
                    // Overridden
                },
                exec: function () {
                    if (this.condition()) {
                        return this.generate();
                    }
                    return [];
                }
            }
        );

        var ContextIdentifierExpected = declare("ContextIdentifierExpected", SuggestionContext, {
            condition: function () {
                return TokenUtils.foundToken(TokenUtils.TOKENS.identifier, this.getExpected());
            },
            generate: function () {
                var suggestions = [];
                var exception = this.handler.getParseException();
                if (exception != null) {
                    suggestions = this.handler.getParserConnector().getIdentifiers();
                    suggestions = suggestions.concat(this.handler.getParserConnector().getListIdentifiers());
                }
                return SuggestionUtils.createSuggestionArray(suggestions, this.handler.getCursorFrom(), this.handler.getCursorTo());
            }
        });

        var ContextIdentifierDefinitionExpected = declare("ContextIdentifierDefinitionExpected", SuggestionContext, {
            condition: function () {
                return TokenUtils.foundToken(TokenUtils.TOKENS.identifierDefinition, this.getExpected()) ||
                    TokenUtils.foundToken(TokenUtils.TOKENS.listIdentifierDefinition, this.getExpected());
            },
            generate: function () {
                var newVarSug = new Suggestion("<new variable>", this.handler.getCursorFrom(), this.handler.getCursorTo());
                newVarSug.setSelected(true);
                var suggestions = this.callContextGenerate(ContextIdentifierExpected);
                suggestions.push(newVarSug);
                return suggestions;
            }
        });

        var ContextBuiltInOption = declare("ContextBuiltInOption", SuggestionContext, {
            condition: function () {
                return TokenUtils.foundToken(TokenUtils.TOKENS.builtInOption, this.getExpected());
            },
            generate: function () {
                var suggestions = hintMetadata.instance().getFreeMarkerBuiltins();
                return SuggestionUtils.createSuggestionArray(suggestions, this.handler.getCursorFrom(), this.handler.getCursorTo());
            }
        });

        var ContextSimpleSuggestions = declare("ContextSimpleSuggestions", SuggestionContext, {
            condition: function () {
                return true;
            },
            generate: function () {
                var suggestions = this.getExpected();
                return SuggestionUtils.createSuggestionArray(suggestions, this.handler.getCursorFrom(), this.handler.getCursorTo());
            }
        });

        var ContextRootSuggestions = declare("ContextRootSuggestions", SuggestionContext, {
            condition: function () {
                return this.handler.getParseException() == null;
            },
            generate: function () {
                var suggestions = TokenUtils.getRootTokens();
                return SuggestionUtils.createSuggestionArray(suggestions, this.handler.getCursorFrom(), this.handler.getCursorTo());
            }
        });

        var ContextOperationTokens = declare("ContextOperationTokens", SuggestionContext, {
            condition: function () {
                var lexerConnector = this.handler.getLexerConnector();
                return lexerConnector.checkState(State.STATE_PCDATA) || lexerConnector.checkState(State.STATE_CLOSE_TAG);
            },
            generate: function () {
                var allSuggestions = this.handler.getParserConnector().getOperationStackedTokens();
                var suggestions = allSuggestions[allSuggestions.length - 1];
                dojoArray.forEach(suggestions, function (sug) {
                    suggestions.push(sug);
                });
                return SuggestionUtils.createSuggestionArray(suggestions, this.handler.getCursorFrom(), this.handler.getCursorTo());
            }
        });

        var ContextsHandler = declare("ContextsHandler", null, {
            filterText: null,
            constructor: function (editor, exception, lexConn, parseConn, parseOffset, cursorFrom, cursorTo) {

                this.editor = editor;
                this.exception = exception;
                this.lexerConnector = lexConn;
                this.parserConnector = parseConn;

                cursorTo = (cursorTo === undefined) ? cursorFrom : cursorTo;

                var startOffset = CodeMirrorUtils.cursorToOffset(editor, cursorFrom);
                var endOffset = CodeMirrorUtils.cursorToOffset(editor, cursorTo);

                if (exception != null && exception.getFound() != null) {
                    startOffset = parseOffset;
                    cursorFrom = CodeMirrorUtils.offsetToCursor(editor, startOffset);
                }

                this.curFrom = cursorFrom;
                this.curTo = cursorTo;

                if (startOffset < endOffset) {
                    this.filterText = editor.getValue().substring(startOffset, endOffset);
                }

                this.contexts = [
                    new ContextIdentifierExpected(this),
                    new ContextIdentifierDefinitionExpected(this),
                    new ContextBuiltInOption(this),
                    new ContextSimpleSuggestions(this),
                    new ContextRootSuggestions(this),
                    new ContextOperationTokens(this)
                ];
            },
            getEditor: function () {
                return this.editor;
            },
            getParseException: function () {
                return this.exception;
            },
            getLexerConnector: function () {
                return this.lexerConnector;
            },
            getParserConnector: function () {
                return this.parserConnector;
            },
            getCursorFrom: function () {
                return this.curFrom;
            },
            getCursorTo: function () {
                return this.curTo;
            },
            generate: function () {
                var suggestions = [];
                dojoArray.forEach(this.contexts, function (context) {
                    var genSuggestions = context.exec();
                    suggestions = suggestions.concat(genSuggestions);
                });

                if (this.filterText !== null) {
                    suggestions = SuggestionUtils.filterSuggestionsArray(suggestions, this.filterText);
                }

                return suggestions;
            }
        });

        CodeMirror.freemarkerHint = function (editor) {
            return scriptHint(editor);
        }

        function scriptHint(editor) {
            // Find the token at the cursor
            var cursor = editor.getCursor();
            var fmEditor = editor.getFreeMarkerEditor();
            var editorValue = CodeMirrorUtils.cutValueTillCursor(editor, cursor);

            var lexerConnector = new LexerConnector();
            fmEditor.lex(editorValue, lexerConnector);
            var tokensArr = lexerConnector.getTokens();

            var parseStartOffset = 0;

            var lastFmTokenIndex = null;
            if (tokensArr.length > 0) {
                lastFmTokenIndex = tokensArr.length;
                tokensArr.reverse();
                dojoArray.some(tokensArr, function (n) {
                    --lastFmTokenIndex;
                    if (n.isInstanceOf(FMTokenNode)) {
                        return true;
                    }
                });
                tokensArr.reverse();
            }

            var parserConnector = new ParserConnector();
            if (lastFmTokenIndex != null) {
                var removedTokens;
                if (!lexerConnector.checkState(State.STATE_PCDATA)) {
                    removedTokens = tokensArr.splice(0, lastFmTokenIndex);
                }
                else {
                    removedTokens = tokensArr.splice(0, lastFmTokenIndex + 1);
                }

                try {
                    parserConnector.setCatchErrors(true);
                    var removedTokensLexerConn = new LexerConnector();
                    removedTokensLexerConn.setTokens(removedTokens);
                    var rootToken = fmEditor.parse(removedTokensLexerConn, parserConnector);
                }
                catch (e) {
                    console.error(e)
                }

                if (removedTokens.length) {
                    parseStartOffset = removedTokens[removedTokens.length - 1].stop + 1;
                }
            }

            var contextHandlers = [];

            /**
             * First parser exception for current cursor
             */
            var currTokenLexerConnector = lexerConnector.clone();
            var currTokenParserConnector = parserConnector.clone();
            var currTokenException = null;
            try {
                currTokenLexerConnector.setTokens(tokensArr);
                currTokenParserConnector.setCatchErrors(false);
                var astTree = fmEditor.parse(currTokenLexerConnector, currTokenParserConnector);
            }
            catch (e) {
                currTokenException = e;
            }

            var contextsHandler = new ContextsHandler(editor, currTokenException, currTokenLexerConnector, currTokenParserConnector, parseStartOffset, cursor);
            contextHandlers.push(contextsHandler);

            /**
             * Second parser exception for previous token
             */
            // going back one token without considering the lexer state could be problematic.
            var prevTokenLexerConnector = lexerConnector.clone();
            var prevTokenParserConnector = parserConnector.clone();
            var prevTokenException = null;
            if (tokensArr.length > 0) {
                var prevTokensArr = tokensArr.slice(); //duplicate <array>
                prevTokensArr.pop();
                prevTokenLexerConnector.setTokens(prevTokensArr);
                prevTokenParserConnector.setCatchErrors(false);
                try {
                    var astTree = fmEditor.parse(prevTokenLexerConnector, prevTokenParserConnector);
                }
                catch (e) {
                    prevTokenException = e;
                }
            }

            if (prevTokenException != null) {
                var prevCursor = CodeMirrorUtils.offsetToCursor(editor, prevTokenException.getOffset());
                var prevTokenContextsHandler = new ContextsHandler(editor, prevTokenException, prevTokenLexerConnector, prevTokenParserConnector, parseStartOffset, prevCursor, cursor);
                contextHandlers.push(prevTokenContextsHandler);
            }

            //////////////////////////////////

            var expected = [];
            dojoArray.forEach(contextHandlers, function (handler) {
                var genSuggestions = handler.generate();
                expected = expected.concat(genSuggestions);
            });

            expected = SuggestionUtils.sortSuggestionsArray(expected);

            return expected;
        }
    });
