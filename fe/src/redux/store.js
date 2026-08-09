import UIReducer from './UIReducer'
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
    reducer: {
        ui: UIReducer
    }
})
export default store
