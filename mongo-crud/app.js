const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/productdb').then(()=>console.log('MongoDB connected')).catch(err=>console.error('MongoDB connection error:',err.message));
const productSchema=new mongoose.Schema({name:{type:String,required:[true,'Name is required'],trim:true},price:{type:Number,required:[true,'Price is required'],min:[0,'Price cannot be negative']},description:{type:String,default:''}},{timestamps:true});
const Product=mongoose.model('Product',productSchema);

function handleError(err,res){if(err.name==='ValidationError')return res.status(400).json({error:err.message});if(err.name==='CastError')return res.status(400).json({error:'Invalid product id'});console.error(err);res.status(500).json({error:'Server error'})}
app.post('/products',async(req,res)=>{try{const product=await Product.create({name:req.body.name,price:req.body.price,description:req.body.description});res.status(201).json(product)}catch(err){handleError(err,res)}});
app.get('/products',async(req,res)=>{try{res.json(await Product.find().sort({createdAt:-1}))}catch(err){handleError(err,res)}});
app.get('/products/:id',async(req,res)=>{try{const product=await Product.findById(req.params.id);if(!product)return res.status(404).json({error:'Product not found'});res.json(product)}catch(err){handleError(err,res)}});
app.put('/products/:id',async(req,res)=>{try{const product=await Product.findByIdAndUpdate(req.params.id,{name:req.body.name,price:req.body.price,description:req.body.description},{returnDocument:'after',runValidators:true});if(!product)return res.status(404).json({error:'Product not found'});res.json(product)}catch(err){handleError(err,res)}});
app.delete('/products/:id',async(req,res)=>{try{const product=await Product.findByIdAndDelete(req.params.id);if(!product)return res.status(404).json({error:'Product not found'});res.json({message:'Product deleted',product})}catch(err){handleError(err,res)}});
app.listen(3000,()=>console.log('Server running on http://localhost:3000'));
