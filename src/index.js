import snakeCase from 'snake-case';
import _ from 'lodash';

function isFrozen(t) {
	if (_.isFunction(Object.isFrozen)) {
		return Object.isFrozen(t);
	}
	return false;
}

function freeze(t) {
	if (_.isFunction(Object.freeze)) {
		Object.freeze(t);
	}
}

// Wraps the handler function to allow returning only state diff.
function wrapHandler(handler) {
	return function (state, ...args) {
		return _.assign({}, state, handler(state, ...args));
	};
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
export default function makeReducer(initialState, handlers = {}, actionTypePrefix = '') {
	const wrapHandlers = _.isObject(initialState);
	const transitions = {};

	const reducer = function reducer(state = initialState, action) {
		const fn = transitions[action.type];
		if (!fn) {
			return state;
		}
		return fn(state, action.payload, action.error);
	};

	reducer.getPrefix = function getPrefix() {
		return actionTypePrefix;
	};

	/**
	 * Gets initial state.
	 * @return {object} A copy of initial state.
	 */
	reducer.getInitialState = function getInitialState() {
		return { ...initialState };
	};

	function completeActionType(type) {
		if (!actionTypePrefix) return type;
		const s = actionTypePrefix.indexOf('/') >= 0 ? '' : '/';
		return `${actionTypePrefix}${s}${type}`;
	}

	/**
	 * Makes function to create action.
	 * @param  {string} [type] Action type.
	 * @param  {function} [payloadReducer] (optional) A function to transform multiple arguments as a unique payload.
	 * @param {function} [metaCreator] (optional) A function to transform multiple arguments as a unique metadata object.
	 * @return {function} A function to create action (aka action creator).
	 */
	function makeActionCreator(type, payloadReducer = _.identity, metaReducer) {
		const actionType = completeActionType(type);
		const hasMeta = _.isFunction(metaReducer);

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
	reducer.on = function on(type, transition, payloadReducer = _.identity, metaReducer) {
		let handler = transition;
		let actionType = type;
		if (_.isFunction(type)) {
			handler = type;
			if (!handler.name) {
				throw new Error('unexpected anonymous transition function');
			}
			actionType = snakeCase(handler.name).toUpperCase();
		}

		if (!actionType) {
			throw new Error('action type is not defined');
		}

		if (!_.isFunction(handler)) {
			throw new Error('transition is not a function');
		}

		transitions[completeActionType(actionType)] = wrapHandlers ? wrapHandler(handler) : handler;

		return makeActionCreator(actionType, payloadReducer, metaReducer);
	};

	if (typeof handlers === 'object') {
		const creators = {};
		const canFreeze = !isFrozen(handlers);
		_.forOwn(handlers, (value, name) => {
			if (!_.isFunction(value)) return;
			const type = snakeCase(name).toUpperCase();
			creators[name] = reducer.on(type, value);
			if (canFreeze) {
				handlers[name] = creators[name]; // eslint-disable-line
			}
		});

		if (canFreeze) {
			freeze(handlers);
		}
	}

	return reducer;
}

/**
 * Combines reducers into reducer that dispatches action to appropriate reducer depending on action type prefix.
 * @param  {functions} ...reducers List of reducer functions to dispatch.
 * @return {function} A reducer function that dispatches action to appropriate reducer depending on action type prefix.
 */
export function makePrefixMapReducer(...reducers) {
	if (reducers.some(r => !_.isFunction(r))) {
		throw new Error('all arguments must be a function');
	}

	const initAction = { type: '@@redux/INIT' };
	const initialState = reducers.reduce((a, r) => Object.assign(a, r(undefined, initAction)), {});

	function prefixOf(r, i) {
		// TODO warning about foreign reducers
		const p = _.isFunction(r.getPrefix) ? r.getPrefix() : `@@FOREIGN${i}`;
		if (p && p.charAt(p.length - 1) === '/') {
			return p.substr(0, p.length - 1);
		}
		return p;
	}

	const reducerMap = reducers.reduce((a, r, i) => ({ ...a, [prefixOf(r, i)]: r }), {});

	const reducer = function reducer(state = initialState, action) {
		const i = action.type.indexOf('/');
		const prefix = i >= 0 ? action.type.substring(0, i) : '';
		if (prefix) {
			const fn = reducerMap[prefix];
			return fn(state, action);
		}
		// TODO try to dispatch foreign reducers
		return state;
	};

	reducer.getInitialState = function getInitialState() {
		return { ...initialState };
	};

	return reducer;
}
