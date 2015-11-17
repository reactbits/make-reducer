"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = makeReducer;
function makeReducer() {
	var transitions = {};

	var reducer = function reducer(state, action) {
		var fn = transitions[action.type];
		if (!fn) {
			return fn;
		}
		return fn(state, action.data);
	};

	reducer.add = function (type, transition) {
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