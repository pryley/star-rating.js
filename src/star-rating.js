/**!
 * Star Rating
 *
 * Version: 1.3.3
 * Author: Paul Ryley (http://geminilabs.io)
 * URL: https://github.com/geminilabs/star-rating.js
 * License: MIT
 */

;(function( window, document, undefined )
{
	"use strict";

	var Plugin = function( el, options )
	{
		this.el = el;
		this.options = options;
		this.metadata = this.el.getAttribute( 'data-options' );
		this.stars = 0;
		this.events = {
			'mousemove': this.move.bind( this ),
		};

		this.init();
	};

	Plugin.prototype = {

		defaults: {
			clearable  : true,
			initialText: "Click to Rate",
			onClick    : null,
			showText   : true,
		},

		init: function()
		{
			if( this.el.tagName !== 'SELECT' )return;

			for( var i = 0; i < this.el.length; i++ ) {
				if( this.el[i].value === '' )continue;
				// abort if any value is not numerical
				if( isNaN( parseFloat( this.el[i].value )) || !isFinite( this.el[i].value ))return;
				this.stars++;
			}

			// abort if number of stars is outside the 1-10 range
			if( this.stars < 1 || this.stars > 10 )return;

			this.config = this._extend( {}, this.defaults, this.options, this.metadata );

			var form = this.el.closest( 'form' );

			this.build();

			this._on( "change", this.el, this.change.bind( this ));
			this._on( "mouseenter", this.wrap, this.enter.bind( this ));
			this._on( "mouseleave", this.wrap, this.leave.bind( this ));
			this._on( "click", this.wrap, this.select.bind( this ));

			if( form ) {
				this._on( "reset", this.el.closest( 'form' ), this.clear.bind( this ));
			}

			this.current = this.el.options[ this.el.selectedIndex ].value;
			this.selected = this.current;

			this.select();

			return this;
		},

		build: function()
		{
			var ordered = {};
			var unordered = {};

			var wrapper = this._createEl( "span", {
				"class": "gl-star-rating",
				"data-star-rating": "",
			});

			this.el.parentNode.insertBefore( wrapper, this.el );
			wrapper.appendChild( this.el );

			this.wrap = this._insertAfterEl( this.el, "span", {
				"class": "gl-star-rating-stars",
			});

			if( this.config.showText ) {
				this.text = this._insertAfterEl( this.wrap, "span", {
					"class": "gl-star-rating-text",
				});
			}

			for( var i = 0; i < this.el.length; i++ ) {
				if( this.el[i].value !== '' ) {
					unordered[ this.el[i].value ] = this.el[i].text;
				}
			}

			Object.keys( unordered ).sort().forEach( function( key ) {
				ordered[key] = unordered[key];
			});

			for( var key in ordered ) {
				this._appendTo( this.wrap, 'span', {
					"data-value": key,
					"data-text": ordered[ key ],
				});
			}
		},

		change: function()
		{
			this.show( this.el.options[ this.el.selectedIndex ].value );
		},

		clear: function( ev )
		{
			if( this.config.clearable || ev !== undefined ) {
				this.el.value = "";
				this.selected = "";
				this.show(0);
			}
		},

		enter: function()
		{
			var rect = this.wrap.getBoundingClientRect();

			this._on( "mousemove", this.wrap, this.events.mousemove );
			this.offsetLeft = rect.left + document.body.scrollLeft;
		},

		getIndexFromPosition: function( pageX )
		{
			this.star = Math.round( this.wrap.offsetWidth / this.stars );
			return Math.min(
				Math.ceil( Math.max( pageX - this.offsetLeft, 1 ) / this.star ),
				this.stars
			);
		},

		leave: function()
		{
			this._off( "mousemove", this.wrap, this.events.mousemove );
			this.show( this.selected );
		},

		move: function( ev )
		{
			this.show( this.getIndexFromPosition( ev.pageX ));
		},

		select: function( ev )
		{
			var index = this.current;

			if( ev !== undefined ) {
				index = this.getIndexFromPosition( ev.pageX );
				if( this.current !== '' && parseFloat( this.selected ) === index ) {
					this.clear();
					return;
				}
			}

			this.el.value = index;
			this.selected = index;

			this.show( index );

			if( ev !== undefined && typeof this.config.onClick === 'function' ) {
				this.config.onClick( this.el );
			}
		},

		show: function( index )
		{
			if( index < 0 || index === "" ) {
				index = 0;
			}
			if( index > this.stars ) {
				index = this.stars;
			}

			this._removeClass( this.wrap, 's' + ( 10 * this.current ));
			this._addClass( this.wrap, 's' + ( 10 * index ));

			if( this.config.showText ) {
				this.text.textContent = index < 1 ? this.config.initialText : this.wrap.childNodes[ index - 1 ].dataset.text;
			}

			this.current = index;
		},

		_addClass: function( el, className )
		{
			if( el.classList ) el.classList.add( className );
			else if( !this._hasClass( el, className )) el.className += ' ' + className;
		},

		_appendTo: function( el, tag, attributes )
		{
			var newEl = this._createEl( tag, attributes );
			el.innerHTML += newEl.outerHTML;
		},

		_createEl: function( tag, attributes )
		{
			var el = ( typeof tag === 'string' ) ? document.createElement( tag ) : tag;

			attributes = attributes || {};

			for( var key in attributes ) {
				el.setAttribute( key, attributes[ key ] );
			}

			return el;
		},

		/**
		 * https://github.com/angus-c/just#just-extend
		 */
		_extend: function()
		{
			var args = [].slice.call( arguments );
			var deep = false;
			if( typeof args[0] === 'boolean' ) {
				deep = args.shift();
			}
			var result = args[0];
			var extenders = args.slice(1);
			var len = extenders.length;
			for( var i = 0; i < len; i++ ) {
				var extender = extenders[i];
				for( var key in extender ) {
					var value = extender[ key ];
					if( deep && value && ( typeof value == 'object' )) {
						var base = Array.isArray( value ) ? [] : {};
						result[ key ] = this._extend( true, base, value );
					}
					else {
						result[ key ] = value;
					}
				}
			}
			return result;
		},

		_hasClass: function( el, className )
		{
			if( el.classList ) return el.classList.contains( className );
			else return new RegExp( '\\b' + className + '\\b' ).test( el.className );
		},

		_insertAfterEl: function( el, tag, attributes )
		{
			var newEl = this._createEl( tag, attributes );
			el.parentNode.insertBefore( newEl, el.nextSibling );

			return newEl;
		},

		_off: function( type, el, handler )
		{
			if( el.detachEvent ) el.detachEvent( 'on' + type, handler );
			else el.removeEventListener( type, handler );
		},

		_on: function( type, el, handler )
		{
			if( el.attachEvent ) el.attachEvent( 'on' + type, handler );
			else el.addEventListener( type, handler );
		},

		_removeClass: function( el, className )
		{
			if( el.classList ) el.classList.remove( className );
			else el.className = el.className.replace( new RegExp( '\\b' + className + '\\b', 'g' ), '' );
		},
	};

	Plugin.defaults = Plugin.prototype.defaults;

	if( window.jQuery ) {
		jQuery.fn.starrating = function( options ) {
			return this.each( function() {
				if( !jQuery.data( this, "plugin_starrating" )) {
					jQuery.data( this, "plugin_starrating", new Plugin( this, options ));
				}
			});
		};
	}

	window.StarRating = Plugin;

})( window, document );

if( this.Element ) {
	(function( ElementPrototype )
	{
		// matches polyfill
		ElementPrototype.matches = ElementPrototype.matches ||
		ElementPrototype.matchesSelector ||
		ElementPrototype.webkitMatchesSelector ||
		ElementPrototype.msMatchesSelector ||
		function( selector )
		{
			var node = this;
			var nodes = ( node.parentNode || node.document ).querySelectorAll( selector );
			var i = -1;
			while( nodes[++i] && nodes[i] !== node );
			return !!nodes[i];
		};

		// closest polyfill
		ElementPrototype.closest = ElementPrototype.closest ||
		function( selector )
		{
			var el = this;
			while( el.matches && !el.matches( selector )) el = el.parentNode;
			return el.matches ? el : null;
		};
	})( Element.prototype );
}
