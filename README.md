<h1 align="center">🤞🏽 vouch</h1>

[![Build Status](https://travis-ci.org/chadian/vouch.svg?branch=master)](https://travis-ci.org/chadian/vouch)
[![npm](https://img.shields.io/npm/v/vouch-promise.svg)](https://www.npmjs.com/package/vouch-promise)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/chadian/vouch/blob/master/LICENSE.txt)

A typescript promise library designed against the Promises/A+ specification. It has been tested with the [Promises/A+ test suite](https://github.com/promises-aplus/promises-tests) so it should work other promise libraries and implementations.

## Installation
To install using `npm`:
`npm install vouch-promise`

or with `yarn`:
`yarn add vouch-promise`

## Usage

### Within a typescript project
This project was created was written in typescript and
has been published with its types. After it's been installed
it can be imported like this:
`import { Vouch } from 'vouch-promise';`

### Within a node + commonjs project
It can also be used within a node project, using commonjs:
`const { Vouch } = require('vouch-promise');`

## Releasing
Run `npm run release` to release vouch.

This will:
  * Bump the version in the `package.json`
  * Tag the release with the release
  * Publish the package to npm
