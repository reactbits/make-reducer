'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = makeReducer;

var _snakeCase = require('snake-case');

var _snakeCase2 = _interopRequireDefault(_snakeCase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function identity(t) {
	return t;
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

	/**
  * Makes function to create action.
  * @param  {string} [type] Action type.
  * @param  {function} [payloadReducer] (optional) A function to transform multiple arguments as a unique payload.
  * @param {function} [metaCreator] (optional) A function to transform multiple arguments as a unique metadata object.
  * @return {function} A function to create action (aka action creator).
  */
	function makeActionCreator(type) {
		var payloadReducer = arguments.length <= 1 || arguments[1] === undefined ? identity : arguments[1];
		var metaReducer = arguments[2];

		var actionType = actionTypePrefix + type;
		var hasMeta = typeof metaReducer === 'function';

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
		var payloadReducer = arguments.length <= 2 || arguments[2] === undefined ? identity : arguments[2];
		var metaReducer = arguments[3];

		var handler = transition;
		var actionType = type;
		if (typeof type === 'function') {
			handler = type;
			if (!handler.name) {
				throw new Error('unexpected anonymous transition function');
			}
			actionType = (0, _snakeCase2.default)(handler.name).toUpperCase();
		}

		if (!actionType) {
			throw new Error('action type is not defined');
		}

		if (typeof handler !== 'function') {
			throw new Error('transition is not a function');
		}

		transitions[actionTypePrefix + actionType] = handler;

		return makeActionCreator(actionType, payloadReducer, metaReducer);
	};

	// TODO remove or deprecate this API
	reducer.add = reducer.on;

	if ((typeof handlers === 'undefined' ? 'undefined' : _typeof(handlers)) === 'object') {
		Object.keys(handlers).forEach(function (name) {
			var value = handlers[name];
			if (typeof value !== 'function') return;
			var type = (0, _snakeCase2.default)(name).toUpperCase();
			reducer.on(type, value);
		});
	}

	return reducer;
}