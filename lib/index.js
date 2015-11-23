'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = makeReducer;
function identity(t) {
	return t;
}

/**
 * Creates reducer function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [initialState] The initial state.
 *
 * @param {string} [actionTypePrefix] The prefix for all actions registered in this reducer.
 *
 * @returns {function} A reducer function to use with Redux store.
 */
function makeReducer(initialState) {
	var actionTypePrefix = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

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
  * Registers transition function to be used to handle specified action type.
  *
  * @param {any} [type] Specifies action type. It can be a named function where
  * name of function specifies action type and the function itself is used to handle
  * this action type.
  *
  * @param {function} [transition] (optional) A function to handle the action type.
  *
  * @param {function} [payloadReducer] (optional) A function to transform multiple arguments as a unique payload.
  *
  * @param {function} [metaCreator] (optional) A function to transform multiple arguments as a unique metadata object.
  *
  * @returns {function} A function to create action (aka action creator).
  */
	reducer.add = function (type, transition) {
		var payloadReducer = arguments.length <= 2 || arguments[2] === undefined ? identity : arguments[2];
		var metaReducer = arguments[3];

		if (typeof type === 'function') {
			transition = type;
			type = transition.name;
		}

		if (!type) {
			throw new Error('action type is not defined');
		}

		if (typeof transition !== 'function') {
			throw new Error('transition is not a function');
		}

		type = actionTypePrefix + type;
		var hasMeta = typeof metaReducer === 'function';

		transitions[type] = transition;

		return function () {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			var action = {
				type: type,
				payload: payloadReducer.apply(undefined, args)
			};

			if (args.length === 1 && args[0] instanceof Error) {
				// Handle FSA errors where the payload is an Error object. Set error.
				action.error = true;
			}

			if (hasMeta) {
				action.meta = metaReducer.apply(undefined, args);
			}

			return action;
		};
	};

	return reducer;
}