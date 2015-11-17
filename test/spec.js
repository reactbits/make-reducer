import makeReducer from '../src/';
import {createStore} from 'redux';
import expect from 'expect.js';

describe("with makeReducer", () => {
	it("counter example looks trivial", () => {

		const initialState = 0;
		const reducer = makeReducer(initialState);
		const increment = reducer.add('INCREMENT', (counter) => counter + 1);
		const decrement = reducer.add('DECREMENT', (counter) => counter - 1);

		const store = createStore(reducer);

		store.dispatch(increment());
		expect(store.getState()).to.be(1);

		store.dispatch(decrement());
		expect(store.getState()).to.be(0);
	});

	it("you can use named functions", () => {

		const initialState = 0;
		const reducer = makeReducer(initialState);
		const increment = reducer.add(function INCREMENT(counter) { return counter + 1; });
		const decrement = reducer.add(function DECREMENT(counter) { return counter - 1; });

		const store = createStore(reducer);

		store.dispatch(increment());
		expect(store.getState()).to.be(1);

		store.dispatch(decrement());
		expect(store.getState()).to.be(0);
	});

	it("reducer should not change state if action type is unknown", () => {
		const initialState = -1;
		const reducer = makeReducer(initialState);
		const store = createStore(reducer);
		store.dispatch({type: '@@unknown'});
		expect(store.getState()).to.be(initialState);
	});
});
