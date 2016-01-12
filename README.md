[![npm version](https://badge.fury.io/js/make-reducer.svg)](https://badge.fury.io/js/make-reducer)
[![Build Status](https://travis-ci.org/reactbits/make-reducer.svg)](https://travis-ci.org/reactbits/make-reducer)
[![codecov.io](https://codecov.io/github/reactbits/make-reducer/coverage.svg?branch=master)](https://codecov.io/github/reactbits/make-reducer?branch=master)

# make-reducer

Functions to easily build redux reducers without boilerplate code.

## Counter example

```js
const initialState = 0;
const reducer = makeReducer(initialState);

const increment = reducer.on('INCREMENT', (counter) => counter + 1);
const decrement = reducer.on('DECREMENT', (counter) => counter - 1);

const store = createStore(reducer, initialState);

store.dispatch(increment());
store.dispatch(decrement());
```

You can use named functions to define actions.

```js
const initialState = 0;
const reducer = makeReducer(initialState);

const increment = reducer.on(function INCREMENT(counter) { return counter + 1; });
const decrement = reducer.on(function DECREMENT(counter) { return counter - 1; });

const store = createStore(reducer, initialState);

store.dispatch(increment());
store.dispatch(decrement());
```
