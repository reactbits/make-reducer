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
export default function makeReducer(initialState, actionTypePrefix = '') {
	const transitions = {};

	const reducer = function reducer(state = initialState, action) {
		const fn = transitions[action.type];
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
	reducer.on = function on(type, transition, payloadReducer = identity, metaReducer) {
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
		const hasMeta = typeof metaReducer === 'function';

		transitions[type] = transition;

		return (...args) => {
			const action = {
				type,
				payload: payloadReducer(...args),
			};

			if (args.length === 1 && args[0] instanceof Error) {
				// Handle FSA errors where the payload is an Error object. Set error.
				action.error = true;
			}

			if (hasMeta) {
				action.meta = metaReducer(...args);
			}

			return action;
		};
	};

	// TODO remove or deprecate this API
	reducer.add = reducer.on;

	return reducer;
}
