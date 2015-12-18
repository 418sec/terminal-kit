/*
	The Cedric's Swiss Knife (CSK) - CSK terminal toolbox
	
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



// Load modules
//var events = require( 'events' ) ;
var events = require( 'nextgen-events' ) ;



function Element() { throw new Error( 'Use Element.create() instead' ) ; }
module.exports = Element ;
Element.prototype = Object.create( events.prototype ) ;
Element.prototype.constructor = Element ;
Element.prototype.elementType = 'Element' ;



Element.create = function createElement( options )
{
	var element = Object.create( Element.prototype ) ;
	element.create( options ) ;
	return element ;
} ;



// Useful to split that for inheritance
Element.prototype.create = function createElement( options )
{
	if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	Object.defineProperties( this , {
		parent: { value: options.parent && options.parent.elementType ? options.parent : null } ,
		document: { value: null , enumerable: true , writable: true } ,
		outputDst: { value: options.outputDst || options.parent.inputDst } ,
		inputDst: { value: null , enumerable: true , writable: true } ,
		label: { value: options.label || '' , enumerable: true , writable: true } ,
		content: { value: options.content || '' , enumerable: true , writable: true } ,
		key: { value: options.key || null , enumerable: true , writable: true } ,
		value: { value: options.value || null , enumerable: true , writable: true } ,
		
		outputX: { value: options.outputX || options.x || 0 , enumerable: true , writable: true } ,
		outputY: { value: options.outputY || options.y || 0 , enumerable: true , writable: true } ,
		outputWidth: { value: options.outputWidth || options.width || 1 , enumerable: true , writable: true } ,
		outputHeight: { value: options.outputHeight || options.height || 1 , enumerable: true , writable: true } ,
		
		savedCursorX: { value: 0 , enumerable: true , writable: true } ,
		savedCursorY: { value: 0 , enumerable: true , writable: true } ,
		
		hasFocus: { value: false , enumerable: true , writable: true } ,
		children: { value: [] , enumerable: true , writable: true } ,
		//onKey: { value: this.onKey.bind( this ) , writable: true } ,
	} ) ;
	
	// Children needs an inputDst, by default, everything is the same as for output (except for Container)
	this.inputDst = this.outputDst ;
	this.inputX = this.outputX ;
	this.inputY = this.outputY ;
	this.inputWidth = this.outputWidth ;
	this.inputHeight = this.outputHeight ;
	
	if ( this.parent )
	{
		this.document = this.parent.document ;
		this.document.assignId( this , options.id ) ;
		this.parent.attach( this ) ;
	}
} ;



Element.prototype.attach = function attach( element )
{
	// Insert it if it is not already a child
	if ( this.children.indexOf( element ) === -1 )
	{
		element.parent = this ;
		element.document = this.document ;
		this.children.push( element ) ;
	}
	return this ;
} ;



Element.prototype.attachTo = function attachTo( element )
{
	if ( element.elementType ) { element.attach( this ) ; }
	return element ;
} ;



Element.prototype.isAncestorOf = function isAncestorOf( element )
{
	var currentElement = element ;
	
	while ( true )
	{
		if ( currentElement === this )
		{
			// Self found: ancestor match!
			return true ;
		}
		else if ( ! currentElement.parent )
		{
			// The element is either detached or attached to another parent element
			return false ;
		}
		else if ( currentElement.parent.children.indexOf( currentElement ) === -1 )
		{
			// Detached but still retain a ref to its parent.
			// It's probably a bug, so we will remove that link now.
			currentElement.parent = null ;
			return false ;
		}
		
		currentElement = currentElement.parent ;
	}
} ;



Element.prototype.saveCursor = function saveCursor()
{
	if ( this.inputDst )
	{
		this.savedCursorX = this.inputDst.cx ;
		this.savedCursorY = this.inputDst.cy ;
	}
	else if ( this.outputDst )
	{
		this.savedCursorX = this.outputDst.cx ;
		this.savedCursorY = this.outputDst.cy ;
	}
	
	return this ;
} ;



Element.prototype.restoreCursor = function restoreCursor()
{
	if ( this.inputDst )
	{
		this.inputDst.cx = this.savedCursorX ;
		this.inputDst.cy = this.savedCursorY ;
		this.inputDst.drawCursor() ;
	}
	else if ( this.outputDst )
	{
		this.outputDst.cx = this.savedCursorX ;
		this.outputDst.cy = this.savedCursorY ;
		this.outputDst.drawCursor() ;
	}
	
	return this ;
} ;



Element.prototype.draw = function draw()
{
	this.saveCursor() ;
	this.descendantDraw() ;
	this.ascendantDraw() ;
	this.drawCursor() ;
	return this ;
} ;



// Draw all the children
Element.prototype.descendantDraw = function descendantDraw( isSubcall )
{
	var i , iMax ;
	
	//console.error( '\ndescendantDraw: ' , this.elementType , this.id , "  (" + this.children.length + " children)" ) ;
	
	if ( this.preDrawSelf )
	{
		//console.error( 'preDrawSelf: ' , this.elementType , this.id ) ;
		this.preDrawSelf( ! isSubcall ) ;
	}
	
	for ( i = 0 , iMax = this.children.length ; i < iMax ; i ++ )
	{
		//console.error( ">>>" , i , iMax ) ;
		this.children[ i ].descendantDraw( true ) ;
	}
	
	if ( isSubcall && this.postDrawSelf )
	{
		//console.error( 'postDrawSelf: ' , this.elementType , this.id ) ;
		this.postDrawSelf( ! isSubcall ) ;
	}
	
	return this ;
} ;



// Post-draw from the current element through all the ancestor chain
Element.prototype.ascendantDraw = function ascendantDraw()
{
	//console.error( '\nascendantDraw: ' , this.elementType , this.id ) ;
	var currentElement ;
	
	if ( this.postDrawSelf )
	{
		//console.error( 'postDrawSelf: ' , this.elementType , this.id ) ;
		this.postDrawSelf( true ) ;
	}
	
	currentElement = this ;
	
	while ( currentElement.outputDst !== currentElement.document.outputDst && currentElement.parent )
	{
		currentElement = currentElement.parent ;
		
		if ( currentElement.outputDst !== currentElement.inputDst && currentElement.postDrawSelf )
		{
			//console.error( 'postDrawSelf: ' , currentElement.elementType , currentElement.id ) ;
			currentElement.postDrawSelf( false ) ;
		}
	}
	
	return this ;
} ;



// Draw cursor from the current element through all the ancestor chain
Element.prototype.drawCursor = function drawCursor()
{
	var currentElement ;
	
	if ( this.drawSelfCursor )
	{
		this.drawSelfCursor( true ) ;
	}
	
	currentElement = this ;
	
	while ( currentElement.outputDst !== currentElement.document.outputDst && currentElement.parent )
	{
		currentElement = currentElement.parent ;
		
		if ( currentElement.drawSelfCursor )
		{
			currentElement.drawSelfCursor( false ) ;
		}
	}
	
	return this ;
} ;



// Should be redefined
Element.prototype.computeBoundingBoxes = null ;	// should be a function if this element can be drawn
Element.prototype.preDrawSelf = null ;	// should be a function if this element can be drawn
Element.prototype.postDrawSelf = null ;	// should be a function if this element can be drawn
Element.prototype.drawSelfCursor = null ;	// should be a function if this element's cursor can be drawn
Element.prototype.getValue = function getValue() { return null ; } ;
Element.prototype.setValue = function setValue() {} ;


