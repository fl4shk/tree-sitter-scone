/**
 * @file The Scone Language
 * @author FL4SHK
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "scone",

  extras: $ => [
    " ",
    "\t",
    "\r",
    "\n",
    $.comment,
  ],

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => seq(
      $.module, repeat(choice($.funcDecl, $.structDecl))
    ),
    module: $ => seq('module', $.ident, ';'),
    funcDecl: $ => seq(
      'def', $.ident,
      optional(seq('[', $.genericDeclList, ']')),
      '(', optional($.funcArgDeclList), ')',
      '->', $.typeWithOptPreKwVar, '{',
        repeat($.stmt),
      '}', ';'
    ),

    funcArgDeclList: $ => seq(
      $.ident, ':', $.typeWithOptPreKwVar,
      repeat(
        seq(',', $.ident, ':', $.typeWithOptPreKwVar)
      ),
      optional(','),
    ),

    funcNamedArgImplList: $ => seq(
      $.funcNamedArgImplItem,
      repeat(seq(',', $.funcNamedArgImplItem)),
      optional(','),
    ),

    funcNamedArgImplItem: $ => seq($.ident, '=', $.expr),

    funcUnnamedArgImplList: $ => prec.right(
      seq($.expr, repeat(seq(',', $.expr)))
    ),

    structDecl: $ => seq(
      'struct', $.ident,
      optional(seq('[', $.genericDeclList,']')),
      '{',
        repeat(seq($.varEtcDeclMost, ';')),
      '}',
      ';'
    ),
    varEtcDeclMost: $ => seq(
      $.ident, ':', $.typeWithoutOptPreKwVar
    ),
    stmtVarDecl: $ => seq(
      'var', $.varEtcDeclMost, optional(seq('=', $.expr)), ';'
    ),
    stmtConstDecl: $ => seq(
      'const', $.varEtcDeclMost, '=', $.expr, ';'
    ),
    stmt: $ => choice(
      $.stmtVarDecl /*, $.letDecl*/, $.stmtConstDecl,
      $.stmtBreak, $.stmtContinue,
      $.stmtFor, $.stmtWhile,
      $.stmtIf, $.stmtSwitch,
      $.stmtScope, $.stmtReturn,
      $.stmtCallOrAssignEtc
    ),
    stmtBreak: $ => seq(
      'break', ';'
    ),
    stmtContinue: $ => seq(
      'continue', ';'
    ),

    stmtFor: $ => seq(
      'for', $.ident, 'in', $.expr, choice('to', 'until'), $.expr, '{',
        //$.stmtList,
        repeat($.stmt),
      '}'
    ),
    stmtWhile: $ => seq(
      'while', $.expr, '{',
        repeat($.stmt),
      '}',
    ),

    stmtIf: $ => seq(
      'if', $.expr, '{',
        //stmtList
        repeat($.stmt),
      '}',
      repeat($.stmtElif),
      optional($.stmtElse),
    ),
    stmtElif: $ => seq(
      'elif', $.expr, '{',
        repeat($.stmt),
      '}',
    ),
    stmtElse: $ => seq(
      'else', '{',
        repeat($.stmt),
      '}',
    ),
    stmtSwitch: $ => seq(
      'switch', $.expr, '{',
        repeat($.stmtCase),
        optional($.stmtDefault),
      '}',
    ),
    stmtCase: $ => seq(
      'case', $.expr, '{',
        repeat($.stmt),
      '}',
    ),
    stmtDefault: $ => seq(
      'default', '{',
        repeat($.stmt),
      '}',
    ),
    stmtScope: $ => seq(
      'scope', '{',
        repeat($.stmt),
      '}',
    ),
    stmtReturn: $ => seq(
      'return', optional($.expr), ';',
    ),

    assignOp: $ => choice(
      '=',
      '+=', '-=',
      '*=', '/=', '%=',
      '&=', ',=', '^=',
      '<<=', '>>=',
    ),
    stmtCallOrAssignEtc: $ => seq(
      $.exprLhs,
      optional(seq(
        $.assignOp,
        $.expr,
      )),
      ';',
    ),
    exprLowestNonOp: $ => choice(
      $.exprIdentOrFuncCall,
      $.literal,
      seq('(', $.expr, ')'),
    ),
    expr: $ => seq(
      $.exprLogicOr // the lowest precedence operator
    ),
    exprLogicOr: $ => seq(
      $.exprLogicAnd, repeat(seq('||', $.exprLogicAnd)),
    ),
    exprLogicAnd: $ => seq(
      $.exprBitOr, repeat(seq('&&', $.exprBitOr)),
    ),
    exprBitOr: $ => seq(
      $.exprBitXor, repeat(seq('|', $.exprBitXor)),
    ),
    exprBitXor: $ => seq(
      $.exprBitAnd, repeat(seq('^', $.exprBitAnd)),
    ),
    exprBitAnd: $ => seq(
      $.exprCmpEqNe, repeat(seq('&', $.exprCmpEqNe)),
    ),
    exprCmpEqNe: $ => seq(
      $.exprCmpIneq, repeat(seq(choice('==', '!='), $.exprCmpIneq)),
    ),
    exprCmpIneq: $ => seq(
      $.exprBitShift,
      repeat(seq(choice('<', '<=', '>', '>='), $.exprBitShift)),
    ),
    exprBitShift: $ => seq(
      $.exprAddSub, repeat(seq(choice('<<', '>>'), $.exprAddSub)),
    ),
    exprAddSub: $ => seq(
      $.exprMulDivMod, repeat(seq(choice('+', '-'), $.exprMulDivMod)),
    ),
    exprMulDivMod: $ => seq(
      $.exprUnary, repeat(seq(choice('*', '/', '%'), $.exprUnary)),
    ),
    exprUnary: $ => seq(
      optional($.exprPrefixUnary), $.exprFieldArrEtc
    ),
    exprSuffixFieldMethodAccessDotExpr: $ => seq(
      '.', $.exprIdentOrFuncCallPostDot
    ),
    exprSuffixFieldMethodAccess: $ => seq(
      $.exprSuffixFieldMethodAccessDotExpr
    ),
    exprSuffixDeref: $ => '@',
    exprPrefixUnary: $ => choice(
      '+', '-', '!', '~',
      'addr'
    ),
    exprFieldArrEtc: $ => seq(
      $.exprLowestNonOp, repeat($.exprFieldArrEtcChoice),
    ),
    exprFieldArrEtcChoice: $ => choice(
      $.exprSuffixFieldMethodAccess,
      $.exprSuffixDeref
    ),
    exprLhsLowestNonOpEtc: $ => seq(
      optional('addr'),
      choice(
        //ident exprFuncCallPostIdent?
        $.exprIdentOrFuncCall,
        seq('(', $.exprLhs, ')'),
      )
    ),
    exprLhs: $ => seq(
      $.exprLhsLowestNonOpEtc, repeat($.exprFieldArrEtcChoice),
    ),
    exprIdentOrFuncCall: $ => choice(
      seq(
        $.ident,
        optional($.exprFuncCallPostIdent),
          // if we have `exprFuncCallPostIdent`,
          // this indicates calling either 
          // a function or method
      ),
      seq(
        $.typeBuiltinWithoutOptPreKwVar,
        '(', optional($.funcUnnamedArgImplList), ')',
      ),
      $.exprOpenarrayLit,
    ),
    exprOpenarrayLit: $ => seq(
      //'mkOpenarray', $.exprFuncCallPostGeneric
      '$(', optional($.funcUnnamedArgImplList), ')'
    ),
    exprIdentOrFuncCallPostDot: $ => seq(
      $.ident,
      optional($.exprFuncCallPostIdent),
        // if we have `exprFuncCallPostIdent`,
        // this indicates calling either 
        // a function or method
    ),
    exprFuncCallPostIdent: $ => seq(
      optional($.genericFullImplList),
      $.exprFuncCallPostGeneric,
    ),
    exprFuncCallPostGeneric: $ => $.exprFuncCallPostGenericMain,
    exprFuncCallPostGenericMain: $ => seq(
      '(',
        optional(choice(
          $.exprFuncCallPostGenericChoice0,
          $.funcNamedArgImplList,
        )),
      ')'
    ),
    exprFuncCallPostGenericChoice0: $ => seq(
      $.funcUnnamedArgImplList,
      optional(
        prec.right(seq(',', optional($.funcNamedArgImplList)))
      )
    ),

    typeMainBuiltin: $ => choice(
      $.typeBasicBuiltin,
      $.typeArray,
      $.typeOpenarray,
    ),

    typeMain: $ => choice(
      //$.typeBasicBuiltin,
      //$.typeArray,
      //$.typeOpenarray,
      $.typeMainBuiltin,
      $.typeToResolve,
    ),
    typeArray: $ => seq(
      'array', '[', $.expr, ';', $.typeWithoutOptPreKwVar, ']',
    ),
    typeOpenarray: $ => seq(
      'openarray', '[', $.typeWithoutOptPreKwVar, ']',
    ),
    typeBuiltinWithoutOptPreKwVar: $ => seq(
      repeat('ptr'), $.typeMainBuiltin
    ),
    typeWithoutOptPreKwVar: $ => seq(
      repeat('ptr'), $.typeMain
    ),
    typeWithOptPreKwVar: $ => seq(
      optional(choice('var', repeat1('ptr'))),
      $.typeMain 
    ),
    typeToResolve: $ => seq(
      $.ident,
      optional(
        $.genericFullImplList
      ),
    ),
    typeBasicBuiltin: $ => choice(
      'u8', 'u16', 'u32', 'u64',
      'i8', 'i16', 'i32', 'i64',
      'f32', 'f64',
      'string', 'char',
      'void'
    ),
    genericDeclList: $ => seq(
      $.genericDeclItem,
      repeat(seq(',', $.genericDeclItem)),
      optional(','),
    ),
    genericDeclItem: $ => $.ident,
    genericFullImplList: $ => seq(
      '[',
        choice(
          //seq(
          //  $.genericUnnamedImplList,
          //  optional(seq(',', optional($.genericNamedImplList))),
          //),
          $.genericUnnamedImplList,
          $.genericNamedImplList
        ),
      ']',
    ),
    genericNamedImplList: $ => seq(
      $.genericNamedImplItem,
      repeat(seq(',', $.genericNamedImplItem)),
      optional(','),
    ),

    genericNamedImplItem: $ => seq(
      $.ident, '=', $.typeWithoutOptPreKwVar
    ),
    genericUnnamedImplList: $ => seq(
      $.typeWithoutOptPreKwVar,
      repeat(seq(',', $.typeWithoutOptPreKwVar)) //',' ?
    ),

    ident: $ => /[_a-zA-Z][_a-zA-Z0-9]*/,
    literal: $ => /[0-9]+/,
    comment: $ => seq('#', /.*\n/),
  }
});
