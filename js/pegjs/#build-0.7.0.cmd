@echo off
set pegjs=%~dp0../../node_modules\.bin\pegjs.cmd
call %pegjs% -e fmlexer --track-line-and-column fm-lexer.peg temp
type fm-lexer-header.txt > fm-lexer.js 
type temp >> fm-lexer.js 
type fm-lexer-footer.txt >> fm-lexer.js 

call %pegjs% -e fmparser --track-line-and-column fm-parser.peg temp
type fm-parser-header.txt > fm-parser.js 
type temp >> fm-parser.js 
type fm-parser-footer.txt >> fm-parser.js 

del temp