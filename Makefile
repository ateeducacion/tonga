# Use four spaces as recipe prefix instead of a tab
.RECIPEPREFIX =

.PHONY: up vendor package help

## Start the development server
up:
	npm run start

## Copy vendor libraries from node_modules to js folder
update:
	npm run update

## Build and zip the project using its version from package.json
package:
	VERSION=$(shell node -p "require('./package.json').version")
	mkdir -p dist/package
	cp -R * dist/package/
	zip -r dist/$(shell basename $(CURDIR))-$$VERSION.zip dist/package
	rm -rf dist/package

