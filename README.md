# make-reducer

Functions to easily build redux reducers without boilerplate code.

## Counter example

```js
const initialState = 0;
const reducer = makeReducer(initialState);

const increment = reducer.add('INCREMENT', (counter) => counter + 1);
const decrement = reducer.add('DECREMENT', (counter) => counter - 1);

const store = createStore(reducer);

store.dispatch(increment());
store.dispatch(decrement());
```
