export default function makeReducer(initialState) {
	const transitions = {};

	const reducer = function reducer(state = initialState, action) {
		const fn = transitions[action.type];
		if (!fn) {
			return state;
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
