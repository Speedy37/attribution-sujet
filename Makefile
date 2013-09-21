all: release

dev:
	node_modules/.bin/browserify > static/client.browser.dev.js 

run:
	node server.js

run_coverage:
	node_modules/.bin/istanbul cover server.js
	
unittest:
	node_modules/.bin/nodeunit test/lib/

unittest_coverage:
	node_modules/.bin/istanbul cover test/run.js

fast:
	node_modules/.bin/browserify > static/client.browser.js 

debug:
	node_modules/.bin/browserify --debug client.js > static/client.browser.js 
	
simple:
	node_modules/.bin/browserify client.js > static/client.browser.js
	
release:
	node_modules/.bin/browserify client.js | node_modules/.bin/uglifyjs -mc > static/client.browser.js
	
doc:
	node_modules/.bin/yuidoc ./lib/