import reducers from '../reducers'
import { createLogger } from 'redux-logger'
import { createStore, applyMiddleware } from 'redux'
// For newer versions of redux-thunk, use named import:
import { thunk } from 'redux-thunk'
// For older versions, use: import thunk from 'redux-thunk'

const middleware = [thunk];

if (process.env.NODE_ENV === 'development') {
  middleware.push(createLogger())
}

const store = createStore(
  reducers,
  applyMiddleware(...middleware)
);

export default store;