(genericDeclItem) @type

[
  "module"
  "var"
  "const"
  "break"
  "for"
  "in"
  "until"
  "to"
  "while"
  "if"
  "elif"
  "else"
  "switch"
  "case"
  "default"
  "scope"
  "return"
  "addr"
  "ptr"
] @keyword
[
  "def"
  "struct"
  "u8"
  "u16"
  "u32"
  "u64"
  "i8"
  "i16"
  "i32"
  "i64"
  "f32"
  "f64"
  "string"
  "char"
  "void"
] @type.builtin


(funcDecl
  (ident) @function
  (#match? genericDeclList)
  (funcArgDeclList
    (ident) @variable))
(structDecl
  (ident) @type
  (#match? genericDeclList)
  (varEtcDeclMost
    (ident) @field))
(structDecl
  (ident) @type)
(exprLowestNonOp
  (exprIdentOrFuncCall
    (ident) @variable))
(exprLhsLowestNonOpEtc
  (exprIdentOrFuncCall
    (ident) @variable))
(stmtFor
  (ident) @variable)
(exprIdentOrFuncCallPostDot
  (ident) @field
  (#match? exprFuncCallPostIdent)
)
(exprIdentOrFuncCallPostDot
  (ident) @function
  (exprFuncCallPostIdent))
(exprIdentOrFuncCall
  (ident) @function
  (exprFuncCallPostIdent))
[
  "array"
  "openarray"
] @type

[
  "mkOpenarray"
] @function

(stmtConstDecl
  (varEtcDeclMost
    (ident) @variable))
(stmtVarDecl
  (varEtcDeclMost
    (ident) @variable))

(typeToResolve) @type

;(ident) @variable
(literal) @constant
;(exprFuncCallPostIdent) @function
(comment) @comment
