# Use four spaces as recipe prefix instead of a tab
.RECIPEPREFIX =

.PHONY: up vendor package help

## Start the development server
up:
	npm run start

## Copy vendor libraries from node_modules to js folder
vendor:
	cp node_modules/axios/dist/axios.min.js js/axios.min.js
	cp node_modules/fabric/dist/fabric.min.js js/fabric.min.js
	cp node_modules/file-saver/dist/FileSaver.min.js js/FileSaver.min.js
	cp node_modules/jquery/dist/jquery.min.js js/jquery.min.js
	cp node_modules/jquery-ui-dist/jquery-ui.min.js js/jquery-ui.min.js
	cp node_modules/jspdf/dist/jspdf.min.js js/jspdf.min.js
	cp node_modules/xml2json/lib/xml2json.min.js js/xml2json.min.js
	cp node_modules/@toast-ui/code-snippet/dist/tui-code-snippet.min.js js/tui-code-snippet.min.js
	cp node_modules/@toast-ui/color-picker/dist/tui-color-picker.min.js js/tui-color-picker.min.js

## Build and zip the project using its version from package.json
package:
	VERSION=$(shell node -p "require('./package.json').version")
	mkdir -p dist/package
	cp -R * dist/package/
	zip -r dist/$(shell basename $(CURDIR))-$$VERSION.zip dist/package
	rm -rf dist/package

