all: browser

# Install node modules and components

install: node_modules components

# Standalone

browser: node_modules components
	@./node_modules/.bin/component-build -s hydro-tap -o .
	@mv build.js hydro-tap.js

# Development

build: components
	@./node_modules/.bin/component-build --dev

# Clean

clean: clean-node clean-browser clean-components

clean-node:
	@rm -rf node_modules

clean-browser:
	@rm -f hydro-tap.js

clean-components:
	@rm -rf build
	@rm -rf components

# Support

components: node_modules component.json
	@./node_modules/.bin/component-install --dev

node_modules: package.json
	@npm install

.PHONY: all browser node_modules
