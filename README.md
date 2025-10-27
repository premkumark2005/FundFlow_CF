# 🎯 FundFlow - Crowdfunding Platform

A full-stack MERN (MongoDB, Express, React, Node.js) crowdfunding application with Stripe payment integration, email notifications, and image upload capabilities.

## ✨ Features

### User Features
- 🔐 User authentication & authorization (JWT)
- 📝 Campaign creation & management
- 💳 Stripe payment processing (test mode)
- 🖼️ Image uploads via Cloudinary
- 📧 Email notifications (SendGrid)
- 🎨 Responsive UI with Tailwind CSS
- 👥 Anonymous donations support
- 💬 Donation messages

### Admin Features
- 📊 Dashboard statistics
- 👥 User management
- 🚀 Campaign approval system
- 💰 Donation tracking

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Axios** - HTTP client
- **Stripe.js** - Payment processing
- **Tailwind CSS** - Styling
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Third-Party Services
- **Stripe** - Payment processing
- **SendGrid** - Email delivery
- **Cloudinary** - Image storage

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **MongoDB** (running locally or MongoDB Atlas account)
- **npm** or **yarn**

You'll also need accounts for:
- [Stripe](https://stripe.com) (for payment processing)
- [SendGrid](https://sendgrid.com) (for email notifications)
- [Cloudinary](https://cloudinary.com) (for image uploads)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/premkumark2005/crowdfundProject.git
cd crowdfunding-platform
```

### 2. Backend Setup

```bash
cd backend
npm install
```

**Configure Environment Variables:**

```bash
cp .env.example .env
```

Edit `backend/.env` with your actual credentials:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/crowdfunding

# JWT
JWT_SECRET=your_strong_random_secret_here
JWT_EXPIRE=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_email@example.com

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# App Settings
APP_NAME=FundFlow
FRONTEND_URL=http://localhost:3000
```

**Start Backend Server:**

```bash
npm start
# Server runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

**Configure Environment Variables:**

```bash
cp .env.example .env
```

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

**Start Frontend:**

```bash
npm start
# App runs on http://localhost:3000
```

## 🔧 Configuration Guide

### Stripe Setup

1. Create account at [stripe.com](https://stripe.com)
2. Get test API keys from Dashboard → Developers → API keys
3. Copy **Secret key** to `backend/.env`
4. Copy **Publishable key** to `frontend/.env`

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Any future expiry date and any 3-digit CVC

### SendGrid Setup

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API Key (Settings → API Keys)
3. Verify sender email (Settings → Sender Authentication)
4. Add API key to `backend/.env`

### Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get credentials from Dashboard
3. Add to `backend/.env`

## 📁 Project Structure

```
crowdfunding-platform/
├── backend/
│   ├── controllers/      # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   ├── .env.example      # Environment template
│   └── server.js         # Entry point
├── frontend/
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── context/      # React context
│   │   ├── services/     # API services
│   │   └── App.js        # Main component
│   └── .env.example      # Environment template
└── README.md
```

## 🧪 Testing

### Test a Donation Flow

1. Create a user account
2. Create a campaign
3. Go to another user's campaign
4. Click "Donate"
5. Use Stripe test card: `4242 4242 4242 4242`
6. Check email for confirmation (donor & creator)

## 📧 Email Notifications

The platform sends automated emails for:
- ✅ Donation confirmation (to donor)
- ✅ New donation alert (to campaign creator)

Emails are sent via SendGrid with beautiful HTML templates.

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Protected API routes
- ✅ Environment variables for secrets
- ✅ CORS protection
- ✅ Input validation

## 🚨 Important Security Notes

⚠️ **NEVER commit `.env` files to Git!**

The `.gitignore` files are configured to exclude:
- `.env` files
- `node_modules/`
- Build outputs
- Logs

Always use `.env.example` as a template and keep real credentials private.

## 🌐 Deployment

### Backend (Heroku/Railway/Render)

1. Set environment variables in hosting platform
2. Update `FRONTEND_URL` to production URL
3. Deploy from main branch

### Frontend (Vercel/Netlify)

1. Update `REACT_APP_API_URL` to production backend URL
2. Add Stripe publishable key
3. Deploy

### Database (MongoDB Atlas)

1. Create cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `MONGODB_URI` in backend `.env`

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Campaign Endpoints
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create campaign (auth required)
- `PUT /api/campaigns/:id` - Update campaign (auth required)
- `DELETE /api/campaigns/:id` - Delete campaign (auth required)

### Donation Endpoints
- `POST /api/donations/create-payment-intent` - Create Stripe payment intent
- `POST /api/donations/record-stripe-donation` - Record donation after payment
- `GET /api/donations/user/:userId` - Get user donations

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB is running
- Verify all environment variables are set
- Check port 5000 is available

### Emails not sending
- Verify SendGrid API key is valid
- Check sender email is verified in SendGrid
- Look for errors in backend logs

### Stripe payments failing
- Ensure using test mode keys (start with `sk_test_` and `pk_test_`)
- Verify keys are from same Stripe account
- Check Stripe Dashboard for errors

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Premkumar K**
- GitHub: [@premkumark2005](https://github.com/premkumark2005)
- Email: premkumark102005@gmail.com

## 🙏 Acknowledgments

- Stripe for payment processing
- SendGrid for email delivery
- Cloudinary for image hosting
- MongoDB for database

---

**⭐ If you found this project helpful, please give it a star!**

