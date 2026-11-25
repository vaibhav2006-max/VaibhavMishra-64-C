const express = require('express');
const app = express();
app.use(express.json());

let products = [
  { id: 1, name: 'Laptop', price: 55000, description: '14-inch, 16GB RAM, 512GB SSD' },
  { id: 2, name: 'Earbuds', price: 1999, description: 'Wireless, 20 hours battery' }
];
let nextId = 3;

function validate(body) {
  const { name, price } = body;
  if (!name || typeof name !== 'string' || !name.trim()) return 'name is required';
  if (typeof price !== 'number' || Number.isNaN(price) || price < 0) return 'price must be a non-negative number';
  return null;
}

app.get('/products', (req, res) => res.json(products));
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});
app.post('/products', (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  const product = { id: nextId++, name: req.body.name.trim(), price: req.body.price, description: req.body.description || '' };
  products.push(product);
  res.status(201).json(product);
});
app.put('/products/:id', (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  const error = validate(req.body);
  if (error) return res.status(400).json({ error });
  product.name = req.body.name.trim();
  product.price = req.body.price;
  product.description = req.body.description || '';
  res.json(product);
});
app.delete('/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  const removed = products.splice(index, 1)[0];
  res.json({ message: 'Deleted', product: removed });
});

app.listen(3000, () => console.log('API running on http://localhost:3000'));
