'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = makeReducer;
/**
 * Creates reducer function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [initialState] The initial state.
 *
 * @returns {function} A reducer function to use with Redux store.
 */
function makeReducer(initialState) {
	var transitions = {};

	var reducer = function reducer() {
		var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
		var action = arguments[1];

		var fn = transitions[action.type];
		if (!fn) {
			return state;
		}
		return fn(state, action.data);
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
  * @returns {function} A function to create action (aka action creator).
  */
	reducer.add = function (type, transition) {
		if (typeof type == 'function') {
			transition = type;
			type = transition.name;
		}

		if (!type) {
			throw new Error('action type is not defined');
		}

		if (typeof transition !== 'function') {
			throw new Error('transition is not a function');
		}

		transitions[type] = transition;

		return function (data) {
			return {
				type: type,
				data: data
			};
		};
	};

	return reducer;
}