import makeReducer, { makePrefixMapReducer } from '../src/';
import { createStore } from 'redux';
import expect from 'expect.js';
import * as counterHandlers from './counterHandlers';

describe('with makeReducer', () => {
	it('counter example looks trivial', () => {
		const initialState = 0;
		const reducer = makeReducer(initialState);
		const increment = reducer.on('INCREMENT', (counter) => counter + 1);
		const decrement = reducer.on('DECREMENT', (counter) => counter - 1);

		const store = createStore(reducer, initialState);

		store.dispatch(increment());
		expect(store.getState()).to.be(1);

		store.dispatch(decrement());
		expect(store.getState()).to.be(0);
	});

	it('you can use named functions', () => {
		const initialState = 0;
		const reducer = makeReducer(initialState);
		const increment = reducer.on(function INCREMENT(counter) { return counter + 1; }); // eslint-disable-line
		const decrement = reducer.on(function DECREMENT(counter) { return counter - 1; }); // eslint-disable-line

		const store = createStore(reducer, initialState);

		store.dispatch(increment());
		expect(store.getState()).to.be(1);

		store.dispatch(decrement());
		expect(store.getState()).to.be(0);
	});

	it('reducer should not change state if action type is unknown', () => {
		const initialState = -1;
		const reducer = makeReducer(initialState);
		const store = createStore(reducer, initialState);
		store.dispatch({ type: '@@unknown' });
		expect(store.getState()).to.be(initialState);
	});

	it('custom payload', () => {
		const initialState = '';
		const reducer = makeReducer(initialState, {}, '@@internal/');
		const concat = reducer.on('concat', (state, s) => state + s, (...args) => args.join(','));

		const store = createStore(reducer, initialState);

		store.dispatch(concat('a', 'b', 'c'));
		expect(store.getState()).to.be('a,b,c');
	});

	it('import counter handlers', () => {
		const initialState = 0;
		const handlers = { ...counterHandlers };
		const reducer = makeReducer(initialState, handlers);
		const store = createStore(reducer, initialState);

		expect(handlers.increment).to.be.a('function');
		expect(handlers.decrement).to.be.a('function');

		store.dispatch({ type: 'INCREMENT', payload: 1 });
		expect(store.getState()).to.be(1);

		store.dispatch({ type: 'DECREMENT', payload: 1 });
		expect(store.getState()).to.be(0);
	});
});

describe('makePrefixMapReducer', () => {
	it('should dispatch action to appropriate reducer', () => {
		const actions1 = { set(state, value) { return { value1: value }; } };
		const r1 = makeReducer({ value1: 1 }, actions1, 'R1/');
		const actions2 = { set(state, value) { return { value2: value }; } };
		const r2 = makeReducer({ value2: 2 }, actions2, 'R2');
		const reducer = makePrefixMapReducer(r1, r2);
		const state1 = reducer.getInitialState();
		expect(state1.value1).to.be(1);
		expect(state1.value2).to.be(2);
		const state2 = reducer(state1, actions1.set(3));
		expect(state2.value1).to.be(3);
		const state3 = reducer(state2, actions2.set(4));
		expect(state3.value2).to.be(4);
	});
});
