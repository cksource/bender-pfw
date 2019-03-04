/**
 * @license Copyright (c) 2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

( function( bender ) {

	'use strict';

	if ( window.location.href.indexOf( 'pastefromword/generated' ) == -1 ) {
		return;
	}

	var runner = bender.runner,
		failedTests = {};

	// Overwrite button should be appended when test cases finish to make sure
	// that the the DOM is ready.
	runner.subscribe( runner.TEST_FAIL_EVENT, function( evt ) {
		failedTests[ evt.testName ] = evt;
	} );

	runner.subscribe( runner.TEST_CASE_COMPLETE_EVENT, function( evt ) {
		var failed = CKEDITOR.document.find( 'div.result.fail' ).toArray();

		// Append `Overwrite` button into a single test case.
		for ( var i = 0; i < failed.length; i++ ) {
			var container = failed[ i ],
				testName = container.findOne( 'a' ).getText();

			createSubmit( testName ).insertBefore( container.getFirst() );
			container.append( createSubmit( testName ) );
		}

		var results = CKEDITOR.document.findOne( 'div.results' );

		// Append `Overwrite all` button into test suite.
		if ( results ) {
			var button = new CKEDITOR.dom.element( 'button' ),
				tests = bender.tools.objToArray( failedTests );

			button.setText( 'Overwrite all' );

			// Make it chainable to avoid race conditions on the server side.
			function next() {
				var test = tests.pop();

				// All tests has been overwritten,
				// reload browser to make sure that changes applied.
				if ( !test ) {
					window.location.reload();
					return;
				}

				postOverwrite( test.testName, next );
			}

			button.on( 'click', next );

			button.insertBefore( results.getFirst() );
		}
	} );

	function createSubmit( testName ) {
		var button = new CKEDITOR.dom.element( 'button' );

		button.setText( 'Overwrite' );

		button.on( 'click', function() {
			postOverwrite( testName );

			var result = button.getParent();

			result.removeClass( 'fail' );
			result.addClass( 'ok' );
		} );

		return button;
	}

	function postOverwrite( testName, callback ) {
		var payload = {
			testName: testName,
			content: failedTests[ testName ].error.actual
		};

		CKEDITOR.ajax.post( window.location.href, JSON.stringify( payload ), 'application/json', function( data ) {
			console.warn( testName, 'content replaced!' );

			if ( callback ) {
				callback( data );
			}
		} );
	}

} )( bender );
