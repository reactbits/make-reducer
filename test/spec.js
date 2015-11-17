import makeReducer from '../src/';
import {createStore} from 'redux';
import expect from 'expect.js';

describe("makeReducer", () => {
	it("counter example", () => {

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

	it("should not change state if action is unknown", () => {
		const initialState = -1;
		const reducer = makeReducer(initialState);
		const store = createStore(reducer);
		store.dispatch({type: '@@unknown'});
		expect(store.getState()).to.be(initialState);
	});
});
