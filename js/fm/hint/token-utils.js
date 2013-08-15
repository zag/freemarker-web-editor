define([ "dojo/_base/declare", "dojo/_base/array", "./suggestion-def" ] , function (declare, dojoArray) {
    var TokenUtils = declare("TokenUtils", null, {});
    TokenUtils.getRootTokens = function () {
        return [
            TokenUtils.TOKENS.COMMENT_OPEN.getName(),
            TokenUtils.TOKENS.EXPRESSION_OPEN.getName(),
            TokenUtils.TOKENS.ASSIGN_TAG.getName(),
            TokenUtils.TOKENS.COMPRESS_TAG.getName(),
            TokenUtils.TOKENS.LIST_TAG.getName(),
            TokenUtils.TOKENS.IF_TAG.getName()
        ];
    }

    TokenUtils.foundToken = function (token, expected) {
        var found = false;
        if (token != null) {
            found = dojoArray.indexOf(expected, token.getName()) != -1;
        }
        return found;
    }

    TokenUtils.TOKENS = {
        PCDATA: new SuggestionDefHidden("PCDATA", null),
        COMMENT_OPEN: new SuggestionDefHigh("COMMENT_OPEN", "<#--"),
        FM_COMMENT_CONTENT: new SuggestionDefHidden("FM_COMMENT_CONTENT", null),
        COMMENT_CLOSE: new SuggestionDefHigh("COMMENT_CLOSE", "-->"),
        EXPRESSION_OPEN: new SuggestionDefHigh("EXPRESSION_OPEN", "${"),
        EXPRESSION_CLOSE: new SuggestionDefHigh("EXPRESSION_CLOSE", "}"),
        STRING_START: new SuggestionDefLow("STRING_START", ["\"", "'"]),
        ESCAPED_CHAR: new SuggestionDefLow("ESCAPED_CHAR", ["\\n", "\\t", "\\r", "\\f", "\\b", "\\g", "\\l", "\\a", "\\\\", "\\'", "\\\"", "\\$", "\\{"]),
        STRING_SEQ_MATCH: new SuggestionDefHidden("STRING_SEQ_MATCH", null),
        STRING_END: new SuggestionDefLow("STRING_END", ["\"", "'"]),
        ASSIGN_TAG: new SuggestionDefHigh("ASSIGN_TAG", "<#assign "),
        COMPRESS_TAG: new SuggestionDefHigh("COMPRESS_TAG", "<#compress>"),
        LIST_TAG: new SuggestionDefHigh("LIST_TAG", "<#list "),
        IF_TAG: new SuggestionDefHigh("IF_TAG", "<#if "),
        ELSE_IF_TAG: new SuggestionDefHigh("ELSE_IF_TAG", "<#elseif "),
        ELSE_TAG: new SuggestionDefHigh("ELSE_TAG", "<#else>"),
        TAG_OPEN: new SuggestionDefHidden("TAG_OPEN", "<#"),
        IF_CLOSE_TAG: new SuggestionDefHigh("IF_CLOSE_TAG", "</#if>"),
        COMPRESS_CLOSE_TAG: new SuggestionDefHigh("COMPRESS_CLOSE_TAG", "</#compress>"),
        LIST_CLOSE_TAG: new SuggestionDefHigh("LIST_CLOSE_TAG", "</#list>"),
        END_TAG: new SuggestionDefHidden("END_TAG", "</#"),
        NATURAL_GT: new SuggestionDefLow("NATURAL_GT", ">"),
        NATURAL_GTE: new SuggestionDefLow("NATURAL_GTE", ">="),
        TAG_CLOSE_CLOSE: new SuggestionDefLow("TAG_CLOSE_CLOSE", ">"),
        TAG_CLOSE: new SuggestionDefHigh("TAG_CLOSE", ">"),
        TAG_CLOSE_SELF: new SuggestionDefHigh("TAG_CLOSE_SELF", "/>"),
        DOUBLE_EQUALS: new SuggestionDefLow("DOUBLE_EQUALS", "=="),
        EQUALS: new SuggestionDefLow("EQUALS", "="),
        LESS_THAN: new SuggestionDefLow("LESS_THAN", "<"),
        LESS_THAN_EQUALS: new SuggestionDefLow("LESS_THAN_EQUALS", "<="),
        ESCAPED_GT: new SuggestionDefLow("ESCAPED_GT", "gt"),
        ESCAPED_GTE: new SuggestionDefLow("ESCAPED_GTE", "gte"),
        OPEN_PAREN: new SuggestionDefLow("OPEN_PAREN", "("),
        CLOSE_PAREN: new SuggestionDefLow("CLOSE_PAREN", ")"),
        OPEN_BRACKET: new SuggestionDefLow("OPEN_BRACKET", "["),
        CLOSE_BRACKET: new SuggestionDefLow("CLOSE_BRACKET", "]"),
        OPEN_BRACE: new SuggestionDefLow("OPEN_BRACE", "{"),
        CLOSE_BRACE: new SuggestionDefLow("CLOSE_BRACE", "}"),
        COMMA: new SuggestionDefLow("COMMA", ","),
        SEMICOLON: new SuggestionDefLow("SEMICOLON", ";"),
        COLON: new SuggestionDefLow("COLON", ":"),
        DOT_DOT: new SuggestionDefLow("DOT_DOT", ".."),
        DOT: new SuggestionDefLow("DOT", "."),
        NOT_EQUALS: new SuggestionDefLow("NOT_EQUALS", "!="),
        EXCLAM: new SuggestionDefLow("EXCLAM", "!"),
        PLUS: new SuggestionDefLow("PLUS", "+"),
        MINUS: new SuggestionDefLow("MINUS", "-"),
        DOUBLE_STAR: new SuggestionDefLow("DOUBLE_STAR", "**"),
        TIMES: new SuggestionDefLow("TIMES", "*"),
        DIVIDE: new SuggestionDefLow("DIVIDE", "/"),
        PERCENT: new SuggestionDefLow("PERCENT", "%"),
        BUILT_IN: new SuggestionDefLow("BUILT_IN", "?"),
        EXISTS: new SuggestionDefLow("EXISTS", "??"),
        AND: new SuggestionDefLow("AND", ["&", "&&"]),
        OR: new SuggestionDefLow("OR", ["|", "||"]),
        FALSE: new SuggestionDefLow("FALSE", "false"),
        TRUE: new SuggestionDefLow("TRUE", "true"),
        IN: new SuggestionDefLow("IN", "in"),
        AS: new SuggestionDefHigh("AS", "as"),
        USING: new SuggestionDefLow("USING", "using"),
        DATE_UTILS_IDENT: new SuggestionDefHigh("DATE_UTILS_IDENT", "dateUtils"),
        MARKET_DATA_IDENT: new SuggestionDefHigh("MARKET_DATA_IDENT", "marketData"),
        REPORT_DATA_IDENT: new SuggestionDefHigh("REPORT_DATA_IDENT", "reportData"),
        BUNDLE_IDENT: new SuggestionDefHigh("BUNDLE_IDENT", "bundle"),
        IDENTIFIER: new SuggestionDefHidden("IDENTIFIER", null),
        NUMBER_LITERAL: new SuggestionDefHidden("NUMBER_LITERAL", null),
        NEWLINE: new SuggestionDefHidden("NEWLINE", null),
        WS: new SuggestionDefHidden("WS", null),

        // rules
        identifierDefinition: new SuggestionDefHidden("identifierDefinition", null),
        builtInOption: new SuggestionDefHidden("builtInOption", null),
        metaDataIdentifier: new SuggestionDefHidden("metaDataIdentifier", null),
        identifier: new SuggestionDefHidden("identifier", null),
        listIdentifierDefinition: new SuggestionDefHidden("listIdentifierDefinition", null)
    }

    return TokenUtils;
});