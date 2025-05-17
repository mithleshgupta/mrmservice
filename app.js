const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const docRoutes = require("./routes/docRoutes")

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/docs', docRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});