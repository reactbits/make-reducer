import makeReducer from '../src/';
import {createStore} from 'redux';
import expect from 'expect.js';

describe("with makeReducer", () => {
	it("counter example looks trivial", () => {

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

	it("you can use named functions", () => {

		const initialState = 0;
		const reducer = makeReducer(initialState);
		const increment = reducer.on(function INCREMENT(counter) { return counter + 1; });
		const decrement = reducer.on(function DECREMENT(counter) { return counter - 1; });

		const store = createStore(reducer, initialState);

		store.dispatch(increment());
		expect(store.getState()).to.be(1);

		store.dispatch(decrement());
		expect(store.getState()).to.be(0);
	});

	it("reducer should not change state if action type is unknown", () => {
		const initialState = -1;
		const reducer = makeReducer(initialState);
		const store = createStore(reducer, initialState);
		store.dispatch({type: '@@unknown'});
		expect(store.getState()).to.be(initialState);
	});

	it("custom payload", () => {

		const initialState = '';
		const reducer = makeReducer(initialState, '@@internal/');
		const concat = reducer.on('concat', (state, s) => state + s, (...args) => args.join(','));

		const store = createStore(reducer, initialState);

		store.dispatch(concat('a', 'b', 'c'));
		expect(store.getState()).to.be('a,b,c');
	});
});
