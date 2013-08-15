define([ "dojo/_base/declare" ], function (declare) {
    var CodeMirrorUtils = declare("CodeMirrorUtils", null, {});
    CodeMirrorUtils.cutValueTillCursor = function (editor, cursor) {
        var offset = CodeMirrorUtils.cursorToOffset(editor, cursor)
        var editorValue = editor.getValue();
        editorValue = editorValue.substring(0, offset);
        return editorValue;
    }

    // TODO, redundant
    CodeMirrorUtils.offsetToCursor = function (editor, offset) {
//        var editorValue = editor.getValue();
//        var editorLines = editorValue.split("\n");
//        for (var lineIndex = 0; lineIndex < editorLines.length; ++lineIndex) {
//            var currLineLen = editorLines[lineIndex].length + 1; // +1 for newline
//            if (offset >= currLineLen) {
//                offset -= currLineLen;
//            }
//            else {
//                break;
//            }
//        }
//        return {line: lineIndex, ch: offset};
        return editor.posFromIndex(offset);
    }

    // TODO, redundant
    CodeMirrorUtils.cursorToOffset = function (editor, cursor) {
//        var editorValue = editor.getValue();
//        var accumulatedOffset = 0;
//        var line = cursor.line;
//        var editorLines = editorValue.split("\n");
//        for (var lineIndex = 0; lineIndex < cursor.line; ++lineIndex) {
//            accumulatedOffset += editorLines[lineIndex].length + 1; // +1 for newline
//        }
//        accumulatedOffset += cursor.ch;
//        return accumulatedOffset;
        return editor.indexFromPos(cursor);
    }

    CodeMirrorUtils.moveCursor = function (editor, cursor, moveBy) {
        var editorValue = editor.getValue();
        var offset = CodeMirrorUtils.cursorToOffset(editor, cursor);
        offset += moveBy;
        var newCursor = CodeMirrorUtils.offsetToCursor(editor, offset);
        return newCursor;
    }

    CodeMirrorUtils.getNextToken = function (editor, token) {
        var offset = token.state.getLastIndexInCode();
        var prevCursor = CodeMirrorUtils.offsetToCursor(editor, offset);
        var moveBy = token.state.newLine? 2 : 1;
        var tokenCursor = CodeMirrorUtils.moveCursor(editor, prevCursor, moveBy);
        var nextToken = editor.getTokenAt(tokenCursor);
        return nextToken;
    }

    CodeMirrorUtils.getPreviousToken = function (editor, token) {
        var tokenLen = token.end - token.start;
        var offset = token.state.getLastIndexInCode() - tokenLen;
        var tokenCursor = CodeMirrorUtils.offsetToCursor(editor, offset);
        var prevToken = editor.getTokenAt(tokenCursor);
        if (prevToken.type == null) {
            prevToken = null;
        }
        return prevToken;
    }

    CodeMirrorUtils.getCurrentTokenPart = function (editor) {
        var cursor = editor.getCursor()
        var token = editor.getTokenAt(cursor);
        var tokenCut = token.string.substring(0, cursor.ch - token.start);
        return tokenCut;
    }

    return CodeMirrorUtils;
});