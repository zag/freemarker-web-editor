define([ "dojo/_base/declare", "dojo/_base/array" , "dojo/_base/xhr"], function (declare, dojoArray, dojoXHR) {
    var metadataEntry = declare("metadataEntry", null, {
        constructor: function (origObject) {
            this.name = origObject.name; // assumption
            this.orig = origObject;
        }
    });

    var FreeMarkerEditorMetadata = declare("FreeMarkerEditorMetadata", null, {

        constructor: function () {

            /**
             * FreeMarker Builtins
             */
            this.freeMarkerBuiltins = [
                /* "ancestors"*/
                "byte",
                /*"c",*/
                "cap_first",
                "capitalize",
                "ceiling",
                "children",
                "chop_linebreak",
                "chunk",
                "contains",
                "date",
                "datetime",
                "double",
                "ends_with",
                /*"eval",*/
                "first",
                "floor",
                /*"groups",*/
                "float",
                "has_content",
                "html",
                "index_of",
                "int",
                "interpret",
                "is_string",
                "is_number",
                "is_boolean",
                "is_date",
                "is_method",
                "is_transform",
                "is_macro",
                "is_hash",
                "is_hash_ex",
                "is_sequence",
                "is_collection",
                "is_enumerable",
                "is_indexable",
                "is_directive",
                "is_node",
                "iso",
                "j_string,",
                "js_string",
                "keys",
                "last",
                "last_index_of",
                "left_pad",
                "length",
                "long",
                "lower_case",
                "matches",
                "namespace",
                "new",
                "node_namespace",
                "node_name",
                "node_type",
                "number",
                "number_to_date",
                "number_to_datetime",
                "number_to_time",
                "parent",
                "replace",
                "reverse",
                "right_pad",
                "round",
                "root",
                "rtf",
                "short",
                "size",
                "sort",
                "seq_contains",
                "seq_index_of",
                "seq_last_index_of",
                "sort_by",
                "split",
                "starts_with",
                "string",
                "substring",
                "time",
                "trim",
                "uncap_first",
                "upper_case",
                "url",
                "values",
                "word_list",
                "xhtml",
                "xml"
            ];
        },

        // REST Services could be used to retrieve completion data from server.
        getJsonSync: function (url, callback) {
            dojoXHR.get({
                url: url,
                handleAs: "json",
                sync: true,
                load: callback
            });
        },

        getFreeMarkerBuiltins: function () {
            return this.freeMarkerBuiltins;
        },

        /**
         * Utils
         */
        jsonArrToNameArr: function (jsonArr) {
            var nameArr = [];
            if (jsonArr !== undefined) {
                dojoArray.forEach(jsonArr, function (n) {
                    nameArr.push(n.name);
                });
            }
            return nameArr;
        }
    });
    FreeMarkerEditorMetadata._instance = new FreeMarkerEditorMetadata();
    FreeMarkerEditorMetadata.instance = function () {
        return FreeMarkerEditorMetadata._instance;
    }

    return FreeMarkerEditorMetadata;
});