export default function makeReducer() {
	const transitions = {};

	const reducer = function(state, action) {
		const fn = transitions[action.type];
		if (!fn) {
			return fn;
		}
		return fn(state, action.data);
	};

	reducer.add = function(type, transition) {
		transitions[type] = transition;
		return function(data) {
			return {
				type: type,
				data: data,
			};
		};
	};

	return reducer;
}
