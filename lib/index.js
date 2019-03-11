/**
 * @license Copyright (c) 2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

var path = require( 'path' ),
	fs = require( 'fs' ),
	http = require( 'http' ),

	clientPath = path.join( __dirname, '/client.js' ),
	prefixedClientPath = path.join( '/plugins', clientPath ).split( path.sep ).join( '/' );


module.exports = {

	name: 'bender-pfw',

	attach: function() {
		this.pagebuilders.add( 'pfw', build, this.pagebuilders.getPriority( 'html' ) - 1 );

		this.plugins.addFiles( [ clientPath ] );

		this.middlewares.add( 'pfw', function() {
			return function( req, res, next ) {

				if ( req.url.indexOf( 'pastefromword/generated' ) == -1 || req.method !== 'POST' ) {
					return next();
				}

				overwriteTestFile( req.body, function( err, data ) {
					if ( err ) {
						res.writeHead( 403 );
						res.end( http.STATUS_CODES[ 403 ] );
					} else {
						res.writeHead( 200 );
						res.end( http.STATUS_CODES[ 200 ] );
					}

				} );
			}
		}, this.middlewares.getPriority( 'json' ) + 1 );

		function build( data ) {
			data.parts.push( '<head><script src="' + prefixedClientPath + '"></script></head>' );

			return data;
		}

		function overwriteTestFile( { testName, content }, callback ) {
			var filePath = resolveFilePath( testName, function( err, filePath ) {
				if ( err ) {
					return callback( err );
				}

				fs.writeFile( filePath, content, callback );
			} );
		}

		function resolveFilePath( testName, callback ) {
			var filePath = testName.split( /\s+/ ).slice( 1 ).join( '/' ),
				pfwPath = '/tests/plugins/pastefromword/generated/_fixtures/';

			filePath = path.join( process.cwd(), pfwPath, filePath ) + '.html';

			fs.stat( filePath, function( err, stat ) {
				if ( err ) {
					return callback( err );
				}

				var customExpected = path.join( filePath, '../', 'expected_' + path.basename( filePath ) );

				fs.stat( customExpected, function( err, stat ) {
					if ( stat ) {
						return callback( null, customExpected );
					}

					filePath = path.join( filePath, '../..', 'expected.html' );

					fs.stat( filePath, function( err, stat ) {
						callback( err, filePath );
					} );
				} );

			} );
		}
	}
};
