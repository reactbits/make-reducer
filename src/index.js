import snakeCase from 'snake-case';

function identity(t) { return t; }

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
export default function makeReducer(initialState, handlers = {}, actionTypePrefix = '') {
	const transitions = {};

	const reducer = function reducer(state = initialState, action) {
		const fn = transitions[action.type];
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
	function makeActionCreator(type, payloadReducer = identity, metaReducer) {
		const actionType = actionTypePrefix + type;
		const hasMeta = typeof metaReducer === 'function';

		return (...args) => {
			const action = {
				type: actionType,
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
	reducer.on = function on(type, transition, payloadReducer = identity, metaReducer) {
		let handler = transition;
		let actionType = type;
		if (typeof type === 'function') {
			handler = type;
			if (!handler.name) {
				throw new Error('unexpected anonymous transition function');
			}
			actionType = snakeCase(handler.name).toUpperCase();
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

	if (typeof handlers === 'object') {
		const creators = {};
		for (const name in handlers) {
			if (!handlers.hasOwnProperty(name)) continue;
			const value = handlers[name];
			if (typeof value !== 'function') continue;
			const type = snakeCase(name).toUpperCase();
			creators[name] = reducer.on(type, value);
		}
		for (const name in creators) {
			if (!handlers.hasOwnProperty(name)) continue;
			handlers[name] = creators[name]; // eslint-disable-line
		}
	}

	return reducer;
}
