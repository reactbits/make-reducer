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
		if (typeof(type) == 'function') {
			transition = type;
			type = transition.name;
		}

		if (!type) {
			throw new Error('action type is not defined');
		}

		if (typeof(transition) !== 'function') {
			throw new Error('transition is not a function');
		}

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
