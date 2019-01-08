"use strict";
// TODO: clean up: have all of the supporting code and the parser code separated
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
// tslint:disable-next-line:prefer-const
var ErrorStackParser;
self.importScripts("error-stack-parser.min.js");
self.onmessage = function (msg) {
    var data = msg.data;
    switch (data.type) {
        case "start":
            try {
                start(data.lexemes);
            }
            catch (error) {
                var c = self;
                c.postMessage({ kind: "error", error: error.message });
            }
            break;
        default:
            throw new Error("Unreachable switch arm");
    }
};
// tslint:disable-next-line:variable-name
function start(lexemes_) {
    var lexemes = lexemes_;
    // tslint:disable-next-line:variable-name
    var __id = 0;
    function getAstNodeId() {
        return __id++;
    }
    // tslint:disable-next-line:variable-name
    var __edge_id = 0;
    function get_edge_id() {
        return "e" + __edge_id++;
    }
    var traces = [];
    // ************************************
    function expr(nodeid) {
        var id = getAstNodeId();
        drawNode(id, "mult");
        drawEdge(get_edge_id(), nodeid, id);
        var m = mult(id);
        var op = peek();
        if (op.type === "op" && (op.value === "+" || op.value === "-")) {
            consume(op);
            setNodeLabel(nodeid, "expr\n" + op.value);
            var newId = getAstNodeId();
            drawNode(newId, "expr");
            drawEdge(get_edge_id(), nodeid, newId);
            var e = expr(newId);
            return {
                type: "expr",
                lhs: m,
                op: op.value,
                rhs: e
            };
        }
        else {
            setNodeLabel(nodeid, "expr\n\u2205");
            return m;
        }
    }
    function mult(nodeid) {
        var id = getAstNodeId();
        drawNode(id, "digit");
        drawEdge(get_edge_id(), nodeid, id);
        var d = digit(id);
        var op = peek();
        if (op.type === "op" && (op.value === "*" || op.value === "/")) {
            consume(op);
            setNodeLabel(nodeid, "mult\n" + op.value);
            var newId = getAstNodeId();
            drawNode(newId, "mult");
            drawEdge(get_edge_id(), nodeid, newId);
            var m = mult(newId);
            return {
                type: "mult",
                lhs: d,
                op: op.value,
                rhs: m
            };
        }
        else {
            setNodeLabel(nodeid, "mult\n\u2205");
            return d;
        }
    }
    function digit(nodeid) {
        var d = peek();
        if (d.type === "digit") {
            consume(d);
            setNodeLabel(nodeid, "digit\n" + d.value);
            return {
                type: "digit",
                value: d.value
            };
        }
        else {
            throw new Error("expected digit, got " + JSON.stringify(peek()) + " instead.");
        }
    }
    var rootId = getAstNodeId();
    drawNode(rootId, "expr");
    expr(rootId);
    consume({ type: "eof" });
    end();
    // ************************************
    function trace(actionData) {
        var errors = ErrorStackParser.parse(new Error());
        var c = self;
        var _a = errors[2], lineNumber = _a.lineNumber, columnNumber = _a.columnNumber;
        c.postMessage(__assign({ kind: "trace", position: [lineNumber, columnNumber] }, actionData));
    }
    function drawNode(id, label) {
        trace({
            type: "drawNode",
            id: id,
            label: label
        });
    }
    function drawEdge(id, source, target) {
        trace({
            id: id,
            source: source,
            target: target,
            type: "drawEdge"
        });
    }
    function consume(lex) {
        if (lexemes.length <= 0) {
            throw new Error("consuming an empty arr");
        }
        if (JSON.stringify(lexemes[0]) !== JSON.stringify(lex)) {
            throw new Error("Tried to consume " + JSON.stringify(lex) + ", found " + JSON.stringify(lexemes[0]));
        }
        lexemes = lexemes.slice(1);
        trace({
            type: "consume",
            newLexemes: lexemes
        });
        return null;
    }
    function peek() {
        trace({
            type: "peek"
        });
        if (lexemes.length <= 0) {
            throw new Error("peeking an empty arr");
        }
        return lexemes[0];
    }
    function setNodeLabel(id, label) {
        trace({ type: "setNodeLabel", id: id, label: label });
    }
    function end() {
        var c = self;
        c.postMessage({ kind: "end" });
    }
    return;
}
