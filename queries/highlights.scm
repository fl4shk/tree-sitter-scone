(genericDeclItem) @type
(ident) @variable

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

(exprIdentOrFuncCallPostDot (ident) @field)
(
  exprIdentOrFuncCallPostDot
  (ident) @function
  (exprFuncCallPostIdent)
)
[
  "array"
] @type

[
  "("
  ")"
]

(exprFuncCallPostIdent) @function
(comment) @comment
