/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
    name: 'ausar',

    rules: {
        source_file: $ => $.Package,
        Bool: _ => choice(
            'true',
            'false',
            'True',
            'False',
        ),
        String: _ => /"([^"\\\\]*|\\\\["\\\\bfnrt\/]|\\\\u[0-9a-f]{4})*"/,
        Number: _ => /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/,
        Literal: $ => choice($.Bool, $.String, $.Number),
        Identifier: _ => /[a-zA-Z][a-zA-Z_0-9]*/,
        List: $ => choice(
            seq(
                '[',
                repeat(
                    seq(
                        $.Expression,
                        ',',
                    )
                ),
                $.Expression,
                ']',
            ),
            seq('[', ']'),
        ),
        Map: $ => choice(
            seq(
                '{',
                repeat(
                    seq(
                        $.Expression,
                        ':',
                        $.Expression,
                        ',',
                    )
                ),
                $.Expression,
                ':',
                $.Expression,
                '}',
            ),
            seq('{', '}'),
        ),
        Group: $ => seq(
            '(',
            $.Expression,
            ')',
        ),
        Operand: $ => choice(
            $.Literal,
            $.Identifier,
            $.List,
            $.Map,
            $.Group,
        ),
        Selector: $ => seq(
            '.',
            $.Identifier,
        ),
        Index: $ => seq(
            '[',
            $.Expression,
            ']',
        ),
        Slice: $ => seq(
            '[',
            $.Expression,
            ':',
            $.Expression,
            ']',
        ),
        Arguments: $ => choice(
            seq(
                '(',
                repeat(
                    seq(
                        $.Expression,
                        ',',
                    )
                ),
                $.Expression,
                ')',
            ),
            seq('(', ')'),
        ),
        PrimaryExpr: $ => choice(
            $.Operand,
            seq($.PrimaryExpr, $.Selector),
            seq($.PrimaryExpr, $.Index),
            seq($.PrimaryExpr, $.Slice),
            seq($.PrimaryExpr, $.Arguments),
        ),
        Expression: $ => choice(
            $.UnaryExpr,
            seq(
                repeat1(
                    seq(
                        $.UnaryExpr,
                        $.binary_op,
                    ),
                ),
                $.UnaryExpr,
            ),
        ),
        UnaryExpr: $ => choice(
            seq(
                $.unary_op,
                $.PrimaryExpr,
            ),
            $.PrimaryExpr,
        ),
        unary_op: _ => choice(
            '+', '-', '!', '^', "*", '&', '&^',
        ),
        binary_op: $ => choice(
            '||', '&&', $.rel_op, $.add_op, $.mul_op
        ),
        rel_op: _ => choice(
            '==', '!=', '<', '<=', '>', '>='
        ),
        add_op: _ => choice(
            '+', '-', '|', '^'
        ),
        mul_op: _ => choice(
            '*', '/', '%', '<<', '>>', '&', '&^'
        ),
        assign_op: _ => choice(
            '=', '+=', '-=', '*=', '/=', '%='
        ),
        VariableDecl: $ => seq(
            $.Identifier,
            ':=',
            $.Expression,
        ),
        AssignStmt: $ => seq(
            $.Identifier,
            $.assign_op,
            $.Expression,
        ),
        TernaryStmt: $ => seq(
            $.Expression,
            '?',
            $.Expression,
            ':',
            $.Expression,
        ),
        SimpleStmt: $ => choice(
            $.VariableDecl,
            $.AssignStmt,
            $.TernaryStmt,
            $.Expression,
        ),
        IfStmt: $ => seq(
            'if',
            $.Expression,
            $.Block,
            optional(
                seq(
                    'else',
                    choice(
                        $.IfStmt,
                        $.Block,
                    ),
                ),
            ),
        ),
        ReturnStmt: $ => seq(
            'return',
            repeat(
                seq(
                    $.Expression,
                    ','
                ),
            ),
            $.Expression,
        ),
        ForStmt: $ => seq(
            'for',
            $.Identifier,
            ',',
            $.Identifier,
            ':=',
            'range',
            $.Expression,
            $.Block,
        ),
        Stmt: $ => choice(
            $.IfStmt,
            $.ReturnStmt,
            $.ForStmt,
            $.SimpleStmt,
        ),
        Block: $ => seq(
            '{',
            repeat(
                seq(
                    $.Stmt,
                    ';',
                ),
            ),
            '}'
        ),
        FunctionDecl: $ => seq(
            'func',
            $.Identifier,
            $.Arguments,
            $.Block,
        ),
        Formula: $ => seq(
            'formula',
            $.Identifier,
            $.Block,
        ),
        VariableDeclInFile: $ => seq(
            $.VariableDecl,
            ';',
        ),
        Declare: $ => choice(
            $.FunctionDecl,
            $.Formula,
            $.VariableDeclInFile,
        ),
        File: $ => repeat1($.Declare),
        Import: $ => seq(
            'import',
            '(',
            repeat(
                seq(
                    optional($.Identifier),
                    $.String,
                )
            ),
            ')',
        ),
        Package: $ => seq(
            "package",
            $.Identifier,
            ';',
            optional($.Import),
            $.File,
        ),
    }
});
