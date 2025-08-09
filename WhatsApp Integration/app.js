require('dotenv').config();
const express = require('express');
const app = express();
const whatsappRoute = require('./src/routes/whatsappRoute');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/', whatsappRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
