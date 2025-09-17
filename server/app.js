const express = require('express'); 
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

const app = express(); // <-- fix typo here
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
