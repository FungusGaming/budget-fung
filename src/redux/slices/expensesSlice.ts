import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from 'redux/store'
import { GoogleSpreadsheetRow } from "google-spreadsheet";

const EXPENSES_SHEET_ID = process.env.REACT_APP_SHEET_ID || "";

// Define a type for the slice state
interface ExpensesState {
  sheetId: string,
  expenses: Array<GoogleSpreadsheetRow>,
  reload: boolean,
}

// Define the initial state using that type
const initialState: ExpensesState = {
  sheetId: EXPENSES_SHEET_ID,
  expenses: [],
  reload: false,
}

export const expensesSlice = createSlice({
  name: 'expenses',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setExpenses: (state, action: PayloadAction<Array<GoogleSpreadsheetRow>>) => {
      state.expenses = action.payload
    },
    setSheetId: (state, action: PayloadAction<string>) => {
      state.sheetId = action.payload
    },
    setReload: (state, action: PayloadAction<boolean>) => {
      state.reload = action.payload
    }
  },
})

export const { setExpenses, setSheetId, setReload } = expensesSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectExpenses = (state: RootState) => state.expenses.expenses

export default expensesSlice.reducer