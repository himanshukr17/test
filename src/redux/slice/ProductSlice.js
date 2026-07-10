import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";


export const fetchProducts=createAsyncThunk("fetchProducts",async()=>{
    const res=await axios.get("http://localhost:5000/RWA/Screen/all")
    return  res
})

const ProductSlice=createSlice({
    name:'products',
    initialState:{
        data:null,
        isLoader:false,
        isError:false,
    },
    extraReducers:builder=>{
        builder.addCase(fetchProducts.pending,(state,action)=>{
            state.isLoader=true
        });
        builder.addCase(fetchProducts.fulfilled,(state,action)=>{
            state.isLoader=false,
            state.data=action.payload
        });
        builder.addCase(fetchProducts.rejected,(state,action)=>{
            state.isLoader=false,
            state.isError=true
        });
    }
});

export default ProductSlice.reducer