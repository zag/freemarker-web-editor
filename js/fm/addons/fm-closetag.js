define([ "dojo/_base/array", "../cm/cm-utils" ], function (dojoArr, cmUtils) {

    CodeMirror.defineOption("fmAutoCloseTags", false, function (cm, val, old) {
        if (val && (old == CodeMirror.Init || !old)) {
            var map = {name: "autoCloseTags"};
            if (typeof val != "object") {
                map["'>'"] = function (cm) {
                    handleKey(cm, '>');
                };
            }
            cm.addKeyMap(map);

            CodeMirror.commands.autoCloseTag = function (cm, ch, pos) {
                autoCloseTag(cm, ch, pos);
            }
        } else if (!val && (old != CodeMirror.Init && old)) {
            cm.removeKeyMap("autoCloseTags");
        }
    });

    var fmCompletes = {
        options: [
            {
                tagName: "if",
                complete: "\n\n</#if>",
                skip: "<\\/#if>"
            },
            {
                tagName: "compress",
                complete: "\n\n</#compress>",
                skip: "<\\/#compress>"
            },
            {
                tagName: "list",
                complete: "\n\n</#list>",
                skip: "<\\/#list>"
            }
        ],
        indexOf: function (name) {
            var foundIndex = -1;
            for (var index = 0; index < this.options.length; ++index) {
                if (this.options[index].tagName === name) {
                    foundIndex = index;
                    break;
                }
            }
            return foundIndex;
        }
    };

    function handleKey(cm, ch) {
        var pos = cm.getCursor(), tok = cm.getTokenAt(pos);
        var inner = CodeMirror.innerMode(cm.getMode(), tok.state), state = inner.state;
        if (inner.mode.name != "freemarker") throw CodeMirror.Pass;

        if (ch == ">") {
            var lineTokens = state.getLexerConnector().getTokens().reverse();
            var lastFMNode = null;
            dojoArr.some(lineTokens, function (n) {
                if (n.isInstanceOf(FMTokenNode)) {
                    lastFMNode = n;
                    return true;
                }
            });

            if (lastFMNode == null) {
                throw CodeMirror.Pass;
            }

            var tagName = lastFMNode.text.replace(/^<#([a-zA-Z]+)/, "$1");
            cm.replaceRange(">", pos);
            autoCloseTag(cm, tagName, pos);

            return;
        }

        throw CodeMirror.Pass;
    }

    function autoCloseTag(cm, tagName, pos) {

        // Auto-completed ">"
        var token = cm.getTokenAt(pos);
        if (tagName == ">") {
            tagName = token.string.replace(/^<#([a-zA-Z]+)/, "$1");
        }

        var tagOptionIndex = fmCompletes.indexOf(tagName);
        if (tagOptionIndex == -1) {
            return;
        }

        var tagOption = fmCompletes.options[tagOptionIndex];

        // Ugh..
        var tagCloseToken = cmUtils.getNextToken(cm, token);
        var remaining = cm.getValue().substring(tagCloseToken.state.lastIndexInCode)
        var testRegex = new RegExp("^\\s*" + tagOption.skip, "");

        if (testRegex.test(remaining)) {
            return;
        }

        cm.replaceSelection(tagOption.complete, {line: pos.line + 1, ch: 0});

        var nlcount = tagOption.complete.split("\n").length;
        for (var nl = 0; nl <= nlcount; ++nl) {
            cm.indentLine(pos.line + nl, "smart");
        }
    }
});
