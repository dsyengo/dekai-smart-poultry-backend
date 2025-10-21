import mongoose from "mongoose";


const farmData = new mongoose.Schema({
    filled_farm_data: { type: Boolean }

})

export const farmModel = mongoose.model('farm_model', farmData)