.PHONY: up build test lint fix e2e check package clean help

## Install dependencies and start the dev server
up:
	npm ci
	npm run dev

## Build the static site into dist/
build:
	npm run build

## Unit tests
test:
	npm test

## Lint and typecheck
lint:
	npm run lint
	npm run typecheck

## Fix lint issues
fix:
	npm run lint -- --fix

## End-to-end tests (Chromium, Firefox, WebKit)
e2e:
	npm run e2e

## Full local quality gate
check: lint test build
	npm run check
	npm run e2e

## Zip dist/ as tonga-<version>.zip
package: ZIP = $(shell node -p "require('./package.json').name+'-'+require('./package.json').version").zip
package: build
	rm -f $(ZIP)
	cd dist && zip -qr ../$(ZIP) .

## Remove build output
clean:
	npm run clean

## Show this help
help:
	@awk '/^## /{d=substr($$0,4);next} /^[a-z0-9-]+:/{if(d)printf "\033[36m%-10s\033[0m %s\n",substr($$1,1,length($$1)-1),d;d=""}' Makefile
