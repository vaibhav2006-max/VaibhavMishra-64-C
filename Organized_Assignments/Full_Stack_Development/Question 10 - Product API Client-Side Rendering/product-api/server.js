const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let products = [
  { id: 1, name: 'Smart Watch', price: 2999, rating: 4.2 },
  { id: 2, name: 'Backpack', price: 1299, rating: 4.5 },
  { id: 3, name: 'Headphones', price: 3499, rating: 4.0 }
];
let nextId = 4;

app.get('/api/products', (req, res) => res.json(products));
app.post('/api/products', (req, res) => {
  const { name, price, rating } = req.body;
  if (!name || !String(name).trim()) return res.status(400).json({ error: 'Name is required' });
  if (typeof price !== 'number' || price < 0) return res.status(400).json({ error: 'Price must be a positive number' });
  if (typeof rating !== 'number' || rating < 0 || rating > 5) return res.status(400).json({ error: 'Rating must be between 0 and 5' });
  const product = { id: nextId++, name: String(name).trim(), price, rating };
  products.push(product);
  res.status(201).json(product);
});
app.listen(3000, () => console.log('Open http://localhost:3000'));
