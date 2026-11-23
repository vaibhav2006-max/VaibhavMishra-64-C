const express=require('express');
const session=require('express-session');
const mongoose=require('mongoose');
const path=require('path');
const app=express();
const ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'admin123';

mongoose.connect('mongodb://127.0.0.1:27017/shopdb').then(()=>console.log('MongoDB connected')).catch(err=>console.error('DB error:',err.message));
const Product=mongoose.model('Product',new mongoose.Schema({name:{type:String,required:true,trim:true},price:{type:Number,required:true,min:0},image:{type:String,default:'https://picsum.photos/seed/shop/300/200'},description:{type:String,default:''}}));
const Order=mongoose.model('Order',new mongoose.Schema({customer:String,address:String,items:[{name:String,price:Number,qty:Number}],total:Number,paymentId:String,status:{type:String,default:'PAID'},createdAt:{type:Date,default:Date.now}}));

app.set('view engine','ejs');app.set('views',path.join(__dirname,'views'));app.use(express.urlencoded({extended:false}));
app.use(session({secret:'lab-secret-key',resave:false,saveUninitialized:true}));
app.use((req,res,next)=>{req.session.cart=req.session.cart||[];res.locals.cartCount=req.session.cart.reduce((n,i)=>n+i.qty,0);res.locals.isAdmin=!!req.session.isAdmin;next()});
function requireAdmin(req,res,next){if(req.session.isAdmin)return next();res.redirect('/admin/login')}
const cartTotal=cart=>cart.reduce((sum,i)=>sum+i.price*i.qty,0);

app.get('/',async(req,res)=>res.render('index',{title:'Products',products:await Product.find()}));
app.post('/cart/add/:id',async(req,res)=>{const product=await Product.findById(req.params.id);if(!product)return res.redirect('/');const line=req.session.cart.find(i=>i.id===String(product._id));if(line)line.qty++;else req.session.cart.push({id:String(product._id),name:product.name,price:product.price,qty:1});res.redirect('/cart')});
app.get('/cart',(req,res)=>res.render('cart',{title:'Cart',cart:req.session.cart,total:cartTotal(req.session.cart)}));
app.post('/cart/remove/:id',(req,res)=>{req.session.cart=req.session.cart.filter(i=>i.id!==req.params.id);res.redirect('/cart')});
function processPayment({cardNumber,amount}){const ok=/^\d{16}$/.test(cardNumber.replace(/\s/g,''))&&amount>0;return{success:ok,paymentId:ok?'PAY'+Date.now():null}}
app.get('/checkout',(req,res)=>{if(req.session.cart.length===0)return res.redirect('/cart');res.render('checkout',{title:'Checkout',total:cartTotal(req.session.cart),error:null,form:{}})});
app.post('/checkout',async(req,res)=>{const cart=req.session.cart,total=cartTotal(cart),{customer,address,cardNumber}=req.body,pay=processPayment({cardNumber:cardNumber||'',amount:total});if(!pay.success)return res.render('checkout',{title:'Checkout',total,form:req.body,error:'Payment failed. Enter a valid 16-digit card number.'});const order=await Order.create({customer,address,total,paymentId:pay.paymentId,items:cart.map(({name,price,qty})=>({name,price,qty}))});req.session.orderIds=(req.session.orderIds||[]).concat(String(order._id));req.session.cart=[];res.redirect('/orders')});
app.get('/orders',async(req,res)=>{const orders=await Order.find({_id:{$in:req.session.orderIds||[]}}).sort({createdAt:-1});res.render('orders',{title:'My Orders',orders})});

app.get('/admin/login',(req,res)=>res.render('admin-login',{title:'Seller Login',error:null}));
app.post('/admin/login',(req,res)=>{if(req.body.password===ADMIN_PASSWORD){req.session.isAdmin=true;return res.redirect('/admin')}res.render('admin-login',{title:'Seller Login',error:'Wrong password'})});
app.get('/admin/logout',(req,res)=>{req.session.isAdmin=false;res.redirect('/')});
app.get('/admin',requireAdmin,async(req,res)=>res.render('admin',{title:'Seller Panel',products:await Product.find()}));
app.post('/admin/add',requireAdmin,async(req,res)=>{const{name,price,image,description}=req.body;await Product.create({name,price,image:image||undefined,description});res.redirect('/admin')});
app.get('/admin/edit/:id',requireAdmin,async(req,res,next)=>{try{if(!mongoose.isValidObjectId(req.params.id))return res.redirect('/admin');const product=await Product.findById(req.params.id);if(!product)return res.redirect('/admin');res.render('admin-edit',{title:'Edit Product',product})}catch(err){next(err)}});
app.post('/admin/edit/:id',requireAdmin,async(req,res,next)=>{try{if(!mongoose.isValidObjectId(req.params.id))return res.redirect('/admin');const{name,price,image,description}=req.body;await Product.findByIdAndUpdate(req.params.id,{name,price,image:image||undefined,description},{runValidators:true});res.redirect('/admin')}catch(err){next(err)}});
app.post('/admin/delete/:id',requireAdmin,async(req,res)=>{await Product.findByIdAndDelete(req.params.id);res.redirect('/admin')});
app.use((err,req,res,next)=>{console.error(err);res.status(500).send('Something went wrong: '+err.message)});
app.listen(3000,()=>console.log('Shop running at http://localhost:3000'));
