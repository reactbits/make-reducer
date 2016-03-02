'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = makeReducer;
exports.makePrefixMapReducer = makePrefixMapReducer;

var _snakeCase = require('snake-case');

var _snakeCase2 = _interopRequireDefault(_snakeCase);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function isFrozen(t) {
	if (_lodash2.default.isFunction(Object.isFrozen)) {
		return Object.isFrozen(t);
	}
	return false;
}

function freeze(t) {
	if (_lodash2.default.isFunction(Object.freeze)) {
		Object.freeze(t);
	}
}

/**
 * Creates reducer function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [initialState] The initial state.
 * @param {object} [handlers] The handler map to register.
 * @param {string} [actionTypePrefix] The prefix for all actions registered in this reducer.
 *
 * @return {function} A reducer function to use with Redux store.
 */
function makeReducer(initialState) {
	var handlers = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	var actionTypePrefix = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

	var transitions = {};

	var reducer = function reducer() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
		var action = arguments[1];

		var fn = transitions[action.type];
		if (!fn) {
			return state;
		}
		return fn(state, action.payload, action.error);
	};

	reducer.getPrefix = function getPrefix() {
		return actionTypePrefix;
	};

	/**
  * Gets initial state.
  * @return {object} A copy of initial state.
  */
	reducer.getInitialState = function getInitialState() {
		return _extends({}, initialState);
	};

	function completeActionType(type) {
		if (!actionTypePrefix) return type;
		var s = actionTypePrefix.indexOf('/') >= 0 ? '' : '/';
		return '' + actionTypePrefix + s + type;
	}

	/**
  * Makes function to create action.
  * @param  {string} [type] Action type.
  * @param  {function} [payloadReducer] (optional) A function to transform multiple arguments as a unique payload.
  * @param {function} [metaCreator] (optional) A function to transform multiple arguments as a unique metadata object.
  * @return {function} A function to create action (aka action creator).
  */
	function makeActionCreator(type) {
		var payloadReducer = arguments.length <= 1 || arguments[1] === undefined ? _lodash2.default.identity : arguments[1];
		var metaReducer = arguments[2];

		var actionType = completeActionType(type);
		var hasMeta = _lodash2.default.isFunction(metaReducer);

		return function () {
			var action = {
				type: actionType,
				payload: payloadReducer.apply(undefined, arguments)
			};

			if (arguments.length === 1 && (arguments.length <= 0 ? undefined : arguments[0]) instanceof Error) {
				// Handle FSA errors where the payload is an Error object. Set error.
				action.error = true;
			}

			if (hasMeta) {
				action.meta = metaReducer.apply(undefined, arguments);
			}

			return action;
		};
	}

	reducer.makeActionCreator = makeActionCreator;

	/**
  * Registers transition function to be used to handle specified action type.
  *
  * @param {any} [type] Specifies action type. It can be a named function where
  * name of function specifies action type and the function itself is used to handle
  * this action type.
  *
  * @param {function} [transition] (optional) A function to handle the action type.
  * @param {function} [payloadReducer] (optional) A function to transform multiple arguments as a unique payload.
  * @param {function} [metaCreator] (optional) A function to transform multiple arguments as a unique metadata object.
  *
  * @return {function} A function to create action (aka action creator).
  */
	reducer.on = function on(type, transition) {
		var payloadReducer = arguments.length <= 2 || arguments[2] === undefined ? _lodash2.default.identity : arguments[2];
		var metaReducer = arguments[3];

		var handler = transition;
		var actionType = type;
		if (_lodash2.default.isFunction(type)) {
			handler = type;
			if (!handler.name) {
				throw new Error('unexpected anonymous transition function');
			}
			actionType = (0, _snakeCase2.default)(handler.name).toUpperCase();
		}

		if (!actionType) {
			throw new Error('action type is not defined');
		}

		if (!_lodash2.default.isFunction(handler)) {
			throw new Error('transition is not a function');
		}

		transitions[completeActionType(actionType)] = handler;

		return makeActionCreator(actionType, payloadReducer, metaReducer);
	};

	if ((typeof handlers === 'undefined' ? 'undefined' : _typeof(handlers)) === 'object') {
		var creators = {};
		for (var name in handlers) {
			if (!handlers.hasOwnProperty(name)) continue;
			var value = handlers[name];
			if (!_lodash2.default.isFunction(value)) continue;
			var type = (0, _snakeCase2.default)(name).toUpperCase();
			creators[name] = reducer.on(type, value);
		}

		if (!isFrozen(handlers)) {
			for (var name in creators) {
				if (!handlers.hasOwnProperty(name)) continue;
				handlers[name] = creators[name]; // eslint-disable-line
			}
			freeze(handlers);
		}
	}

	return reducer;
}

/**
 * Combines reducers into reducer that dispatches action to appropriate reducer depending on action type prefix.
 * @param  {functions} ...reducers List of reducer functions to dispatch.
 * @return {function} A reducer function that dispatches action to appropriate reducer depending on action type prefix.
 */
function makePrefixMapReducer() {
	for (var _len = arguments.length, reducers = Array(_len), _key = 0; _key < _len; _key++) {
		reducers[_key] = arguments[_key];
	}

	if (reducers.some(function (r) {
		return !_lodash2.default.isFunction(r);
	})) {
		throw new Error('all arguments must be a function');
	}

	var initAction = { type: '@@redux/INIT' };
	var initialState = reducers.reduce(function (a, r) {
		return Object.assign(a, r(undefined, initAction));
	}, {});

	function prefixOf(r, i) {
		// TODO warning about foreign reducers
		var p = _lodash2.default.isFunction(r.getPrefix) ? r.getPrefix() : '@@FOREIGN' + i;
		if (p && p.charAt(p.length - 1) === '/') {
			return p.substr(0, p.length - 1);
		}
		return p;
	}

	var reducerMap = reducers.reduce(function (a, r, i) {
		return _extends({}, a, _defineProperty({}, prefixOf(r, i), r));
	}, {});

	var reducer = function reducer() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
		var action = arguments[1];

		var i = action.type.indexOf('/');
		var prefix = i >= 0 ? action.type.substring(0, i) : '';
		if (prefix) {
			var fn = reducerMap[prefix];
			return fn(state, action);
		}
		// TODO try to dispatch foreign reducers
		return state;
	};

	reducer.getInitialState = function getInitialState() {
		return _extends({}, initialState);
	};

	return reducer;
}