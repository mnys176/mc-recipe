const mongoose = require('mongoose')
const Schema = mongoose.Schema

const quantifiableSchema = new Schema({
    readable: {
        type: String,
        required: true
    }
    numeric: () 
})

const prepTimeSchema = new Schema({

})

const recipeSchema = new Schema({
    title: { type: String, required: true },
    prepTime: { type: String, required: true },
    about: String,

})