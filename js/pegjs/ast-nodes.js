define([ "dojo/_base/declare", "dojo/_base/array"], function (declare, dojoArray) {
    var GenericNode = declare("GenericNode", null, {
        type: null,
        parent: null,
        constructor: function (type) {
            this.type = type;
        },
        serialize: function (index) {
            return "<" + this.type + "-" + index + ">";
        },
        setParent: function (parent) {
            this.parent = parent;
        },
        getType: function () {
            return this.type;
        },
        visit: function (visitor) {
            visitor(this);
        }
    });

    var TokenNode = declare("TokenNode", GenericNode, {
        text: null,
        start: null,
        stop: null,
        offset: null,
        line: null,
        column: null,
        constructor: function (type, text, offset, line, column) {
            this.text = text;
            this.start = offset;
            this.stop = offset + text.length - 1;

            this.offset = offset;
            this.line = line;
            this.column = column;
        },
        matchesOffset: function (offset) {
            return this.offset === offset;
        }
    });

    var FMTokenNode = declare("FMTokenNode", TokenNode, {
    });

    var SyntaxNode = declare("SyntaxNode", GenericNode, {
        constructor: function (type) {
            this.children = [];
            this.line = null;
        },
        setLine: function (line) {
            this.line = line;
        },
        getLine: function () {
            if (this.line !== null) {
                return this.line;
            }

            var firstLine = null;
            this.visit(function (node) {
                if (node.isInstanceOf(TokenNode)) {
                    if (firstLine == null) {
                        firstLine = node.line;
                    }
                    else {
                        firstLine = Math.min(firstLine, node.line);
                    }
                }
            });
            return firstLine;
        },
        validate: function (connector) {
            return null;
        },
        connectorOperation: function (connector) {
        },
        // http://c2.com/cgi/wiki?HierarchicalVisitorPattern
        visit: function (visitor) {
            dojoArray.forEach(this.children, function (node) {
                node.visit(visitor);
            });
            this.inherited(arguments);
        },
        find: function (offset) {
            var found = null;
            if (this.children.length > 0) {
                dojoArray.forEach(this.children, function (node) {
                    found = node.find(offset);
                    if (found !== null) {
                        return false;
                    }
                });
            }

            if (found == null && this.start === offset) {
                found = this;
            }

            return found;
        },
        addChild: function (aChildren) {
            if (typeof aChildren == "undefined" || aChildren == "") {
                return;
            }

            if (aChildren instanceof Array) {
                var thiz = this;
                dojoArray.forEach(aChildren, function (n) {
                    thiz.addChild(n);
                });
            }
            else {
                if (!aChildren.isInstanceOf(GenericNode)) {
                    return;
                }
                aChildren.setParent(this);
                this.children.push(aChildren);
//                this.stop = Math.max(this.stop, aChildren.stop);
            }
        },
        fold: function () {
            var retNode = this;
            if (this.children.length == 1) {
                retNode = this.children[0];
            }
            return retNode;
        }
    });

    var ErrorNode = declare("ErrorNode", SyntaxNode, {
        errMessage: null,
        helpLink: null,
        setHelpLink: function (link) {
            this.helpLink = link;
        },
        getHelpLink: function () {
            return this.helpLink;
        },
        getErrorMessage: function () {
            return this.errMessage;
        },
        setErrorMessage: function (errMsg) {
            this.errMessage = errMsg;
        }
    });

    var CompressDirectiveOpenTagNode = declare("CompressDirectiveOpenTagNode", SyntaxNode, {
        connectorOperation: function (connector) {
            connector.pushOperationStackedTokens([TokenUtils.TOKENS.COMPRESS_CLOSE_TAG.getName()]);
        }
    });

    var ListDirectiveOpenTagNode = declare("ListDirectiveOpenTagNode", SyntaxNode, {
        connectorOperation: function (connector) {
            connector.pushOperationStackedTokens([TokenUtils.TOKENS.LIST_CLOSE_TAG.getName()]);
        }
    });

    var IfDirectiveOpenTagNode = declare("IfDirectiveOpenTagNode", SyntaxNode, {
        connectorOperation: function (connector) {
            connector.pushOperationStackedTokens([
                TokenUtils.TOKENS.IF_CLOSE_TAG.getName(),
                TokenUtils.TOKENS.ELSE_IF_TAG.getName(),
                TokenUtils.TOKENS.ELSE_TAG.getName()
            ]);
        }
    });

    var CompressCloseTagNode = declare("CompressCloseTagNode", SyntaxNode, {
        connectorOperation: function (connector) {
            connector.popOperationStackedToken(TokenUtils.TOKENS.COMPRESS_CLOSE_TAG.getName());
        }
    });

    var ListCloseTagNode = declare("ListCloseTagNode", SyntaxNode, {
        connectorOperation: function (connector) {
            connector.popListIdentifier();
            connector.popOperationStackedToken(TokenUtils.TOKENS.LIST_CLOSE_TAG.getName());
        }
    });

    var IfDirectiveElseTagNode = declare("IfDirectiveElseTagNode", SyntaxNode, {
        connectorOperation: function (connector) {
            connector.popOperationStackedToken(TokenUtils.TOKENS.ELSE_TAG.getName());
            connector.popOperationStackedToken(TokenUtils.TOKENS.ELSE_IF_TAG.getName());
        }
    });

    var IfCloseTagNode = declare("IfCloseTagNode", SyntaxNode, {
        connectorOperation: function (connector) {
            connector.popOperationStackedToken(TokenUtils.TOKENS.IF_CLOSE_TAG.getName());
            connector.popOperationStackedToken(TokenUtils.TOKENS.ELSE_TAG.getName());
            connector.popOperationStackedToken(TokenUtils.TOKENS.ELSE_IF_TAG.getName());
        }
    });

    var IdentifierNode = declare("IdentifierNode", SyntaxNode, {
        constructor: function (type, identName) {
            this.identName = identName;
        },
        validate: function (connector) {
            return null;
//            var definedIdents = connector.getIdentifiers();
//            definedIdents = definedIdents.concat(connector.getListIdentifiers());
//
//            var errorNode = null;
//            if (dojoArray.indexOf(definedIdents, this.identName) == -1) {
//                errorNode = new ErrorNode("InvalidIdentifier");
//                errorNode.setErrorMessage("Variable \"" + this.identName + "\" not defined");
//                errorNode.setLine(this.getLine());
//            }
//            return errorNode;
        }
    });

    var IdentifierDefinitionNode = declare("IdentifierDefinitionNode", SyntaxNode, {
        constructor: function (type, identName) {
            this.identName = identName;
        },
        connectorOperation: function (connector) {
            connector.markIdentifier(this.identName);
        }
    });

    var ListIdentifierDefinitionNode = declare("ListIdentifierDefinitionNode", SyntaxNode, {
        constructor: function (type, identName) {
            this.identName = identName;
        },
        connectorOperation: function (connector) {
            connector.pushListIdentifier(this.identName);
        }
    });
});