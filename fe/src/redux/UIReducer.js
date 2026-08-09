import { createSlice } from '@reduxjs/toolkit'

export const UISlice = createSlice({
    name: 'ui',
    initialState: {
        data: {
            CollapseMenu: false,
        }
    },
    reducers: {
        CollapseAction: (state, action) => {
            return {
                ...state,
                data: {
                    ...state.data,
                    CollapseMenu: action.payload
                }
            };
        },
    },
})
export const { CollapseAction } = UISlice.actions
export default UISlice.reducer