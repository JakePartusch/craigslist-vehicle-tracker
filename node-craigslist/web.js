'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Request = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('babel-polyfill');

require('source-map-support/register');

var _core = require('./core.js');

var _core2 = _interopRequireDefault(_core);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var request = require('request');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var debug = (0, _debug2.default)('craigslist'),
    DEFAULT_MAX_REDIRECT_COUNT = 5,
    DEFAULT_RETRY_COUNT = 3,
    DEFAULT_TIMEOUT = 30000,
    EVENT_REDIRECT = 'redirect',
    EVENT_REQUEST = 'request',
    EVENT_RESPONSE = 'response',
    FIRST_TRY = 1,
    HTTP_ERROR_CODE_THRESHHOLD = 400,
    HTTP_ERROR_CODE_RETRY_THRESHHOLD = 500,

// reference: https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#3xx_Redirection
HTTP_PROXY_REQUIRED = 305,
    HTTP_REDIRECT_CODE_PERM = 301,
    HTTP_REDIRECT_CODE_TEMP = 302,
    HTTP_REDIRECT_NEW_CODE_PERM = 308,
    HTTP_REDIRECT_NEW_CODE_TEMP = 307,
    REQUEST_OPTIONS = ['agent', 'auth', 'family', 'headers', 'host', 'hostname', 'json', 'localAddress', 'maxRetries', 'method', 'path', 'pathname', 'port', 'protocol', 'query', 'rejectUnauthorized', 'maxRetries', 'rawStream', 'secure', 'socketPath', 'timeout'],
    SECURE_PROTOCOL_RE = /^https/i;

function _augmentRequestOptions(options) {
	var augmented = {},

	/*eslint no-invalid-this:0*/
	self = this;

	// ensure options exist
	options = options || {};

	// apply settings from Ctor
	REQUEST_OPTIONS.forEach(function (field) {
		var value = _core2.default.Validation.coalesce(options[field], self.settings[field]);

		if (!_core2.default.Validation.isEmpty(value)) {
			debug('request %s will be set to %s (options = %s, settings = %s)', field, value, options[field], self.settings[field]);
			augmented[field] = value;
		}
	});

	// ensure maxRetries is applied if one is not supplied
	augmented.maxRetries = _core2.default.Validation.coalesce(augmented.maxRetries, DEFAULT_RETRY_COUNT);

	// ensure rawStream setting is applied if not supplied
	augmented.rawStream = _core2.default.Validation.isEmpty(augmented.rawStream) ? false : augmented.rawStream;

	// ensure default timeout is applied if one is not supplied
	augmented.timeout = _core2.default.Validation.coalesce(augmented.timeout, DEFAULT_TIMEOUT);

	// create `path` from pathname and query.
	augmented.path = _core2.default.Validation.coalesce(augmented.path, augmented.pathname);

	return augmented;
}

function _exec(options, data, tryCount, callback) {
	if (typeof data === 'function' && _core2.default.Validation.isEmpty(callback)) {
		callback = data;
		/*eslint no-undefined:0*/
		data = undefined;
		tryCount = FIRST_TRY;
	}

	if (typeof tryCount === 'function' && _core2.default.Validation.isEmpty(callback)) {
		callback = tryCount;
		tryCount = FIRST_TRY;
	}

	data = data || '';
	options.headers = options.headers || {};
	tryCount = tryCount || FIRST_TRY;

	var exec = void 0,
	    redirectCount = 0,

	/*eslint no-invalid-this:0*/
	self = this;

	exec = new Promise(function (resolve, reject) {
		if (typeof data !== 'string') {
			data = JSON.stringify(data);
		}

		// apply content length header
		options.headers['Content-Length'] = Buffer.byteLength(data);

		// apply application/json header if appropriate
		if (!options.rawStream && options.json && !options.headers['Content-Type']) {
			options.headers['Content-Type'] = 'application/json';
		}

		// provide request event
		if (self.emit) {
			self.emit(EVENT_REQUEST, options);
		}

		var makeRequest = function makeRequest() {
			debug('establishing request with options: %o', options);
			request('http://' + options.hostname + options.path, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					return resolve(body);
				}
			});
		};
		// do it!
		makeRequest();
	});

	return _core2.default.Validation.promiseOrCallback(exec, callback);
}

var Request = exports.Request = function (_events$EventEmitter) {
	_inherits(Request, _events$EventEmitter);

	function Request(settings) {
		_classCallCheck(this, Request);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Request).call(this));

		_this.settings = settings || {};
		return _this;
	}

	/*
 delete (options, callback) {
 	debug('performing DELETE (%o)', options);
 	options = this::_augmentRequestOptions(options);
 	options.method = 'DELETE';
 		return this::_exec(options, callback);
 }
 //*/

	_createClass(Request, [{
		key: 'get',
		value: function get(options, callback) {
			debug('performing GET (%o)', options);
			options = _augmentRequestOptions.call(this, options);
			options.method = 'GET';

			return _exec.call(this, options, callback);
		}
	}, {
		key: 'getRequestOptions',
		value: function getRequestOptions(options) {
			return _augmentRequestOptions.call(this, options);
		}

		/*
  head (options, callback) {
  	debug('performing HEAD (%o)', options);
  	options = this::_augmentRequestOptions(options);
  	options.method = 'HEAD';
  		return this::_exec(options, callback);
  }
  //*/

		/*
  post (options, data, callback) {
  	debug('performing POST (%o)', options);
  	options = this::_augmentRequestOptions(options);
  	options.method = 'POST';
  		return this::_exec(options, data, callback);
  }
  //*/

		/*
  put (options, data, callback) {
  	debug('performing PUT (%o)', options);
  	options = this::_augmentRequestOptions(options);
  	options.method = 'PUT';
  		return this::_exec(options, data, callback);
  }
  //*/

	}]);

	return Request;
}(_events2.default.EventEmitter);

exports.default = { Request: Request };
//# sourceMappingURL=web.js.map
