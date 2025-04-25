const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');


dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger UI
app.use(process.env.DOC_API, swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Sync database
sequelize.sync({ force: false })
  .then(() => console.log('Connected to SQLite'))
  .then(()=>console.log(`http://localhost:${process.env.PORT}${process.env.DOC_API}`))
  .catch((err) => console.error('SQLite connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
