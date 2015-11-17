'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = makeReducer;
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