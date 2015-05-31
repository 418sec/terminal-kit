#!/usr/bin/env node
/*
	The Cedric's Swiss Knife (CSK) - CSK terminal toolbox test suite
	
	Copyright (c) 2009 - 2015 Cédric Ronvel 
	
	The MIT License (MIT)
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

/* jshint unused:false */



require( '../lib/termkit.js' ).getDetectedTerminal( function( error , term ) {
	
	
	var progress ;
	var progressBar ;
	
	function doProgress()
	{
		if ( progress === undefined )
		{
			if ( Math.random() < 0.1 )
			{
				progress = 0 ;
			}
			
			progressBar.update( progress ) ;
			setTimeout( doProgress , 200 + Math.random() * 600 ) ;
		}
		else
		{
			progress += Math.random() / 10 ;
			progressBar.update( progress ) ;
			
			if ( progress >= 1 ) { term( '\n' ) ; setTimeout( process.exit , 2000 ) ; }
			else { setTimeout( doProgress , 5000 + Math.random() * 1000 ) ; }
		}
	}
	
	term.bold( 'Serious stuff in progress: ' ) ;
	
	progressBar = term.progressBar( {
		width: 50 ,
		percent: true ,
		eta: true ,
		/*
		barStyle: term.brightGreen.bold ,
		barBracketStyle: term.brightWhite ,
		percentStyle: term.brightMagenta.inverse ,
		barChar: '~' ,
		barHeadChar: '*' ,
		
		//barChar: ' ' ,
		//barHeadChar: ' ' ,
		//barStyle: term.bgCyan
		//*/
	} ) ;
	
	term.column( 1 ) ;
	
	doProgress() ;
} ) ;




