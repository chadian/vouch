<h1 align="center">🤞🏽 vouch</h1>

[![Build Status](https://travis-ci.org/chadian/vouch.svg?branch=master)](https://travis-ci.org/chadian/vouch)
[![npm](https://img.shields.io/npm/v/vouch-promise.svg)](https://www.npmjs.com/package/vouch-promise)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-blue.svg)](http://commitizen.github.io/cz-cli/)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/chadian/vouch/blob/master/LICENSE.txt)

A typescript promise library designed against the Promises/A+ specification. It has been tested with the [Promises/A+ test suite](https://github.com/promises-aplus/promises-tests) so it should work other promise libraries and implementations.

## Releasing
Run `npm run release` to releaes vouch.

This will:
  * Bump the version in the `package.json`
  * Tag the release with the release
  * Publish the package to npm
