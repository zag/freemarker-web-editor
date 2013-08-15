define([ "dojo/_base/declare",
    "dojo/_base/array",
    "pegjs/fm-lexer",
    "pegjs/fm-parser",
    "fm/cm/cm-utils",
    "fm/addons/fm-matchbrackets",
    "fm/addons/fm-closetag",
    "fm/addons/fm-closechars",
    "fm/addons/match-highlighter",
    "fm/highlighting/fm-highlight",
    "fm/hint/fm-hint"
],
    function (declare, dojoArray, fmlexer, fmparser, cmUtils) {

        var ParserError = declare("ParserError", null, {
            // Glue code from PEGjs parser exception to ours.
            constructor: function (tokens, substrat, pegjsException) {
                var err = this;
                err.expected = [];

                dojoArray.forEach(pegjsException.expected, function (n) {
                    if (/^[a-zA-Z]/.test(n)) {
                        err.expected.push(n);
                    }
                });

                err.found = null;
                if (pegjsException.found !== null) {
                    var tokenizedCut = substrat.substring(pegjsException.offset);
                    err.found = tokenizedCut.substring(1, tokenizedCut.search(/-\d/));
                }

                var offsetCount = 0;
                dojoArray.some(tokens, function (n, i) {
                    var currTokenLen = n.serialize(i).length;
                    if (offsetCount + currTokenLen >= pegjsException.offset) {
                        var errToken = tokens[i];
                        // Calculate actual offset from pseudo-offset
                        var tokenLen = errToken.stop - errToken.start + 1;
                        err.offset = errToken.start + tokenLen;
                        return true;
                    }
                    else {
                        offsetCount += currTokenLen;
                        return false;
                    }
                });
            },
            getFound: function () {
                return this.found;
            },
            getOffset: function () {
                return this.offset;
            },
            getExpected: function () {
                return this.expected;
            },
            setDataObject: function (key, value) {
                this[key] = value;
            },
            getDataObject: function (key) {
                return this[key];
            }
        });

        var FreeMarkerEditor = declare("FreeMarkerEditor", null, {
            lex: function (substrat, lexerConnector) {
                lexerConnector.tokens = fmlexer.parse(substrat, "lexerState", lexerConnector);
                return lexerConnector.tokens;
            },

            parse: function (lexerConnector, parserConnector) {
                var tokens = lexerConnector.getTokens();
                var clonedTokens = tokens.slice();
                var tokenized = "";
                dojoArray.forEach(clonedTokens, function (n, i) {
                    tokenized += n.serialize(i);
                });

                var parserTree;
                try {
                    parserConnector.setTokenArray(clonedTokens);
                    parserTree = fmparser.parse(tokenized, "parserState", parserConnector);

                    parserTree.visit(function (node) {
                        var errorNode = null;
                        if (node.isInstanceOf(ErrorNode)) {
                            errorNode = node;
                        }
                        else if (node.isInstanceOf(SyntaxNode)) {
                            errorNode = node.validate(parserConnector);
                        }

                        if (errorNode !== null) {
                            parserConnector.pushValidationErrorNode(errorNode);
                        }
                        else {
                            if (node.isInstanceOf(SyntaxNode)) {
                                node.connectorOperation(parserConnector);
                            }
                        }
                    });
                }
                catch (parserExp) {
                    throw new ParserError(clonedTokens, tokenized, parserExp);
                }

                return parserTree;
            },

            clearValidationWidgets: function () {
                var fmEditor = this;
                this.codeMirror.operation(function () {
                    for (var key in fmEditor.validationWidgets) {
                        this.removeLineWidget(fmEditor.validationWidgets[key]);
                    }
                    fmEditor.validationWidgets = [];
                });
            },

            validate: function () {
                var editorValue = this.codeMirror.getValue();
                var errorNodes = [];
                try {
                    var lexerConnector = new LexerConnector();
                    this.lex(editorValue, lexerConnector)
                    // Handle AST errors via ErrorNodes
                    var parserConnector = new ParserConnector();
                    parserConnector.setCatchErrors(true);
                    var rootToken = this.parse(lexerConnector, parserConnector);
                    errorNodes = parserConnector.getValidationErrorNodes();
                }
                catch (err) {
                    // Too broke to manage
                    var errorNode = new ErrorNode("TooBroke");
                    var pos = cmUtils.offsetToCursor(this.codeMirror, err.offset);
                    errorNode.setLine(pos.line);
                    errorNode.setErrorMessage("Problem starting with this directive, expected one of the following: " + err.expected.join(", "));
                    errorNodes.push(errorNode);
                }

                var fmEditor = this;
                fmEditor.clearValidationWidgets();
                dojoArray.forEach(errorNodes, function (errorNode, i) {
                    fmEditor.addErrorMarker(errorNode);
                });
            },

            addErrorMarker: function (errorNode) {
                var line = errorNode.getLine();
                var err = errorNode.getErrorMessage();
                this.codeMirror.operation(function () {
                    var fmEditor = this.getFreeMarkerEditor();
                    var msgDiv = document.createElement("div");

                    var errorIconSpan = msgDiv.appendChild(document.createElement("span"));
                    errorIconSpan.innerHTML = "!";
                    errorIconSpan.className = "validation-error-icon";

                    var textNode = document.createTextNode(err);
                    msgDiv.appendChild(textNode);
                    msgDiv.className = "validation-error";

                    var helpLink = errorNode.getHelpLink();
                    if (helpLink !== null) {
                        var helpIconSpan = msgDiv.appendChild(document.createElement("span"));
                        helpIconSpan.className = "validation-help-span";
                        helpIconSpan.innerHTML = " ";
                        var href = helpIconSpan.appendChild(document.createElement("a"));
                        href.innerHTML = "(?)";
                        href.title = "Go to documentation..."
                        href.href = helpLink;
                        href.target = "_blank";
                    }

                    if (fmEditor.validationWidgets[line] === undefined) {
                        fmEditor.validationWidgets[line] = this.addLineWidget(line - 1, msgDiv, {coverGutter: false, noHScroll: true});
                    }
                    else {
//                    // let not show more than one error per line for now...
                    }
                });
            },

            codeChanged: function (cm, firstChange) {
                var fmEditor = cm.getFreeMarkerEditor();

                if (fmEditor.validationTimeout != null) {
                    clearTimeout(fmEditor.validationTimeout);
                }
                fmEditor.validationTimeout = setTimeout(function () {
                    fmEditor.validate()
                }, FreeMarkerEditor.VALIDATION_TIME);
            },

            createEditor: function (textArea) {
                var codeMirror = CodeMirror.fromTextArea(textArea, {
                    mode: {name: "freemarker", fmEditor: this},
                    lineNumbers: true,
                    extraKeys: {"Ctrl-Space": "autoComplete"},
                    indentUnit: 4,
                    indentWithTabs: true,
                    electricChars: true,
                    fmMatchBrackets: true,
                    fmAutoCloseTags: true,
                    fmAutoCloseChars: true,
                    lineWrapping: true
                });

                codeMirror.on("change", this.codeChanged);
                codeMirror.on("cursorActivity", function (cm) {
                    cm.removeLineClass(hlLine, "background", "activeLine");
                    hlLine = cm.addLineClass(cm.getCursor().line, "background", "activeLine");
                });
                var hlLine = codeMirror.addLineClass(0, "background", "activeLine");

                codeMirror.on("cursorActivity", function () {
                    codeMirror.matchHighlight("CodeMirror-matchhighlight");
                });

                return codeMirror;
            },

            constructor: function (textArea, opts) {
                if (opts !== undefined) {
                }

                this.validationWidgets = [];
                this.validationTimeout = null;
                this.identifiers = {};

                this.codeMirror = this.createEditor(textArea);
                this.codeMirror.freemarkerEditor = this;
                this.codeMirror.getFreeMarkerEditor = function () {
                    return this.freemarkerEditor;
                }

                this.validate();
                this.indentCode();
            },

            indentCode: function () {
                var codeMirror = this.codeMirror;
                var last = codeMirror.lineCount();
                codeMirror.operation(function () {
                    for (var i = 0; i < last; ++i) {
                        this.indentLine(i);
                    }
                });
            }
        });
        FreeMarkerEditor.VALIDATION_TIME = 1500;
    });
