const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Import new routes
const residentRoutes = require('./routes/residentRoutes.js');
const staffRoutes = require('./routes/staffRoutes.js');
const meetingRoutes = require('./routes/meetingRoutes.js');
const repairRoutes = require('./routes/repairRoutes.js');
const garageRoutes = require('./routes/garageRoutes.js');
const invoiceRoutes = require('./routes/invoiceRoutes.js');
const authRoutes = require('./routes/auth.js');
const messageRoutes = require('./routes/messageRoutes.js');
const notificationRoutes = require('./routes/notificationRoutes.js');

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());

/* SECURITY AND CORS */
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan('dev'));
app.use(cors({
  origin: ['http://localhost:3000'], // Only allow your frontend
  credentials: true
}));

/* MIDDLEWARE */
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

/* ROUTES */
app.use("/api/residents", residentRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/repairs", repairRoutes);
app.use("/api/garage", garageRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auth', authRoutes);

app.use(errorHandler);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose
  .connect('mongodb://localhost:27017/ine_social', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));