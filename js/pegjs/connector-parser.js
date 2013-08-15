define([ "dojo/_base/declare", "dojo/_base/array", "dojo/_base/lang" ], function (declare, dojoArray, dojoLang) {
    var ParserConnector = declare("ParserConnector", null, {
        constructor: function () {
            // inputs
            this.tokenArr = [];
            this.catchErrors = false;
            this.fmEditor = null;

            // outputs
            this.ast = {};
            this.identifiers = [];
            this.listIdentifiers = [];

//            this.operationTokens = [];
            this.operationStackedTokens = [];
            this.validationErrorNodes = [];
        },
        clone: function () {
            var parserConn = new ParserConnector();
            parserConn.identifiers = this.identifiers;
            parserConn.listIdentifiers = this.listIdentifiers;
            parserConn.operationStackedTokens = this.operationStackedTokens;
            return parserConn;
        },
        pushValidationErrorNode: function (errorNode) {
            this.validationErrorNodes.push(errorNode);
        },
        getValidationErrorNodes: function () {
            return this.validationErrorNodes;
        },
        pushOperationStackedTokens: function (tokens) {
            this.operationStackedTokens.push(tokens);
        },
        popOperationStackedToken: function (token) {
            var lastArr = this.operationStackedTokens[this.operationStackedTokens.length - 1];
            var newLastArr = [];
            dojoArray.forEach(lastArr, function (n) {
               if (token != n) {
                   newLastArr.push(n);
               }
            });

            if (newLastArr.length > 0) {
                this.operationStackedTokens[this.operationStackedTokens.length - 1] = newLastArr;
            }
            else {
                // remove empty array
                this.operationStackedTokens.pop();
            }
        },
        getOperationStackedTokens: function () {
            return this.operationStackedTokens;
        },
        setAST: function (ast) {
            this.ast = ast;
        },
        getAST: function () {
            return this.ast;
        },
        pushListIdentifier: function (identName) {
            this.listIdentifiers.push(dojoLang.trim(identName));
        },
        popListIdentifier: function () {
            this.listIdentifiers.pop();
        },
        getListIdentifiers: function () {
            return this.listIdentifiers;
        },
        getIdentifiers: function () {
            var keys = [];
            for (var key in this.identifiers) {
                keys.push(key);
            }
            return keys;
        },
        markIdentifier: function (identName) {
            this.identifiers[dojoLang.trim(identName)] = true;
        },
        getTokenArray: function () {
            return this.tokenArr;
        },
        setTokenArray: function (tokenArr) {
            this.tokenArr = tokenArr;
        },
        setCatchErrors: function (catchErrors) {
            this.catchErrors = catchErrors;
        },
        getCatchErrors: function () {
            return this.catchErrors;
        }
    });
});
