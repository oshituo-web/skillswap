const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001; // You can choose any port

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
