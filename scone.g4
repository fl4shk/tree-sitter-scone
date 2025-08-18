grammar scone;

module:
	'module' ident '('
		(
			funcDecl
			| structDecl
			//| macroDecl
			//| variantDecl
			//| tupleDecl
			//| constDecl ';'
			//| externDecl
			//| importDecl
		)*
	')'
	';'
	;

funcDecl:
	'def' ident
	( '{' genericDeclList '}' )?
	'('
		funcArgDeclList
	')' '('
		stmtList
	')' ';'
	;

funcArgDeclList:
	( identList ':' typeWithOptPreKwVar ',' )* 
	'result' typeWithOptPreKwVar //typeWithoutOptPreKwVar
	;

funcArgImplList:
	funcArgImplItem ( ',' funcArgImplItem )* ',' ?
	| expr
	;

funcArgImplItem:
	ident '=' expr
	;

structDecl:
	'struct' ident
	( '{' genericDeclList '}' )?
	'('
		( varEtcDeclMost ';' )*
	')'
	;

identList:
	(ident (',' ident)* )+
	;


varEtcDeclMost: // "Most" is short for "Most of it"
	identList ':' typeWithOptPreKwVar
	;

//--------
varDecl:
	'var' varEtcDeclMost ('=' expr)?
	;
letDecl:
	'let' varEtcDeclMost '=' expr
	;
//constDecl:
//	'const' varEtcDeclMost '=' expr
//	;
//--------
stmt:
	varDecl | letDecl //| constDecl
	| breakStmt | continueStmt
	| forStmt | whileStmt
	| ifStmt
	| returnStmt
	| assignStmt
	;
	
stmtList:
	(stmt ';')* 
	;

breakStmt:
	'break'
	;
continueStmt:
	'continue'
	;

forStmt:
	'for' '(' ident 'in' expr ('to' | 'until') expr ')' '('
		stmtList
	')'
	;

whileStmt:
	'while' '(' expr ')' '('
		stmtList
	')'
	;

ifStmt:
	'if' '(' expr ')' '('
		stmtList
	')'
	elifStmt*
	elseStmt?
	;
elifStmt:
	'elif' '(' expr ')' '('
		stmtList
	')'
	;
elseStmt:
	'else' '('
		stmtList
	')'
	;

switchStmt:
	'switch' '('
		expr
	')' '('
		caseStmt*
		defaultStmt?
	')'
	;
caseStmt:
	'case' '(' expr ')' '('
		stmtList
	')'
	;
defaultStmt:
	'default' '('
		stmtList
	')'
	;

returnStmt:
	'return' 
	;

assignStmt:
	exprLhs
	(
		'='
		| '+=' | '-='
		| '*=' | '/=' | '%='
		| '&=' | '|=' | '^='
		| '<<=' | '>>='
	)
	expr
	;
//--------
exprLowestNonOp:
	ident | /*literal |*/ '(' expr ')'
	;

expr:
	exprLowestNonOp
	| exprLogicOr // the lowest precedence operator
	;

exprLogicOr:
	exprLogicAnd
	(
		'||'
		expr
	)?
	;
exprLogicAnd:
	exprBitOr
	(
		'&&'
		expr
	)?
	;
exprBitOr:
	exprBitXor
	(
		'|'
		expr
	)?
	;
exprBitXor:
	exprBitAnd
	(
		'^'
		expr
	)?
	;
exprBitAnd:
	exprCmpEqNe
	(
		'&'
		expr
	)?
	;
exprCmpEqNe:
	exprCmpIneq
	(
		('==' | '!=')
		expr
	)?
	;
exprCmpIneq:
	//exprCmpEqNe
	exprBitShift
	(
		('<' | '<=' | '>' | '>=')
		expr
	)?
	;
exprBitShift:
	exprAddSub
	(
		('<<' | '>>')
		expr
	)?
	;
exprAddSub:
	exprMulDivMod
	(
		('+' | '-')
		expr
	)?
	;
exprMulDivMod:
	exprUnary
	(
		('*' | '/' | '%')
		expr
	)?
	;

exprUnary:
	exprPrefixUnary? exprFieldArrEtc
	;

exprSuffixFieldAccess:
	'.' ident
	;
exprSuffixMethodCall:
	'->' exprFuncCall
	;

exprSuffixDeref:
	'[]'
	;

exprSuffixArray:
	'[' expr ']'
	;

exprPrefixUnary:
	'+' | '-' | '!' | '~'

	| 'addr'
	;

exprFieldArrEtc:
	exprLowestNonOp exprFieldArrEtcChoice*
	;
exprFieldArrEtcChoice:
	exprSuffixFieldAccess
	| exprSuffixMethodCall
	| exprSuffixDeref
	| exprSuffixArray
	| exprFuncCall
	;

exprLhsLowestNonOpEtc:
	'addr' ?
	(
		ident
		| '(' exprLhs ')'
	)
	;

exprLhs:
	exprLhsLowestNonOpEtc exprFieldArrEtcChoice*
	;

exprFuncCall:
	ident ( '{' genericImplList '}' )? 
	'('
		funcArgImplList
	')'
	;
	


//exprFieldArrEtc:
//	(
//		exprPrefixUnary expr
//	) | (
//		exprPrio1
//		(
//			exprSuffixFieldAccess
//			| exprSuffixMethodCall
//			| exprSuffixDeref
//			| exprSuffixArray
//		)*
//	)
//	;
//--------


//expr:
//	exprPrio1
//	(
//		(
//			'.' ident // struct field access
//			'.@' exprFuncCall
//		)
//		expr
//	)?
//	;
//expr:
//	exprPrio1
//	(
//		(
//			'.' ident				// struct field access
//			| '[]'					// pointer dereference
//			| ( '[' expr ']' )	// array access
//			| ( '@' exprFuncCall )	// function call
//			//| ( '$' exprMacroCall	) // macro call (add this later)
//		)
//		expr
//	)?
//	;
//
//exprPrio1:
//	exprPrio2
//	(
//		expr
//	)?
//	;

//--------

typeMain:
	typeBuiltinScalar
	| typeToResolve
	//| 'array' '{'
	//	('dim' '=')? expr ','
	//	('ElemT' '=')? typeWithoutOptPreKwVar
	//'}'
	;


typeArrDim:
	'[' expr ']'
	;

//typeWithoutOptPreKwVar:
//	('ptr')* typeMain typeArrDim*
typeWithOptPreKwVar:
	('var' | 'ptr'+ )? typeMain typeArrDim*
	;

typeToResolve:
	ident ( '{' genericImplList '}' )?
	;

typeBuiltinScalar:
	'u8' | 'u16' | 'u32' | 'u64'
	| 'i8' | 'i16' | 'i32' | 'i64'
	| 'f32' | 'f64'
	| 'string' | 'char'
	| 'void'
	;

genericDeclList:
	genericDeclItem ( ',' genericDeclItem )* ',' ?
	//identList
	;

genericDeclItem:
	identList ',' ?
	;

genericImplList:
	genericImplItem ( ';' genericImplItem )* ',' ?
	;

genericImplItem:
	ident '=' typeWithOptPreKwVar
	// `var` will simply be ignored if this `genericImplList` is for a
	// `struct` field
	;

ident:
	TokIdent
	;

TokIdent:
	[_a-zA-Z][_a-zA-Z0-9]*
	;

//stmtList:
