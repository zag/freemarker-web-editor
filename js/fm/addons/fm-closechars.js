define([ "../cm/cm-utils" ], function (CodeMirrorUtils) {
    CodeMirror.defineOption("fmAutoCloseChars", false, function (cm, val, old) {
        if (val && (old == CodeMirror.Init || !old)) {
            var map = {name: "autoCloseChars"};
            if (typeof val != "object") {
                map["'('"] = function (cm) {
                    autoCloseBrackets(cm, '()');
                };
                map["'['"] = function (cm) {
                    autoCloseBrackets(cm, '[]');
                };
                map["'{'"] = function (cm) {
                    autoCloseBrackets(cm, '{}');
                };
                map["')'"] = function (cm) {
                    checkCloseBracket(cm, ')');
                };
                map["']'"] = function (cm) {
                    checkCloseBracket(cm, ']');
                };
                map["'}'"] = function (cm) {
                    checkCloseBracket(cm, '}');
                };
                map["'\"'"] = function (cm) {
                    checkCloseString(cm, '\"');
                };
                map["'\''"] = function (cm) {
                    checkCloseString(cm, '\'');
                };
                map["Backspace"] = function (cm) {
                    backspaceBracket(cm);
                };
            }
            cm.addKeyMap(map);
        } else if (!val && (old != CodeMirror.Init && old)) {
            cm.removeKeyMap("autoCloseChars");
        }
    });

    function backspaceBracket(cm) {
        var pos = cm.getCursor();
        var offset = CodeMirrorUtils.cursorToOffset(cm, pos);
        var charA = cm.getValue().charAt(offset - 1);
        var charB = cm.getValue().charAt(offset);
        var del;
        del = (charA == '[' && charB == ']');
        del = del || (charA == '(' && charB == ')');
        del = del || (charA == '{' && charB == '}');
        del = del || (charA == '"' && charB == '"');
        del = del || (charA == '\'' && charB == '\'');

        if (del) {
            var from = CodeMirrorUtils.offsetToCursor(cm, offset - 1);
            var to = CodeMirrorUtils.offsetToCursor(cm, offset + 1);
            cm.replaceRange("", from, to);
        }
        else {
            throw CodeMirror.Pass;
        }
    }

    function autoCloseBrackets(cm, str) {
        var pos = cm.getCursor();
        cm.replaceSelection(str, {line: pos.line, ch: pos.ch});

        pos.ch++;
        cm.setCursor(pos);
    }

    function checkCloseBracket(cm, ch) {
        var pos = cm.getCursor();
        var offset = CodeMirrorUtils.cursorToOffset(cm, pos);
        var char = cm.getValue().charAt(offset);
        if (char != ch) {
            cm.replaceSelection(ch, {line: pos.line, ch: pos.ch});
        }

        pos.ch++;
        cm.setCursor(pos);
    }

    function checkCloseString(cm, ch) {
        var pos = cm.getCursor();
        var offset = CodeMirrorUtils.cursorToOffset(cm, pos);
        var char = cm.getValue().charAt(offset);
        if (char != ch) {
            var chch = ch + ch;
            cm.replaceSelection(chch, {line: pos.line, ch: pos.ch});
        }

        pos.ch++;
        cm.setCursor(pos);
    }
});