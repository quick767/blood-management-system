# Blood Management System

A comprehensive web-based blood management system built with React and Node.js to help blood banks manage donations, requests, and inventory efficiently.

## 🩸 Features

- **Donor Management**: Register donors, track donation history
- **Blood Inventory**: Real-time blood stock management
- **Request Management**: Handle blood requests from hospitals
- **User Authentication**: Secure login system with JWT
- **Email Notifications**: Automated email alerts
- **Admin Dashboard**: Complete administrative control
- **Responsive Design**: Works on all devices

## 🛠️ Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Radix UI Components
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer
- Helmet (Security)
- CORS

## 🚀 Live Demo

- **Frontend**: [Live Website](https://blood-management-frontend.vercel.app)
- **Backend API**: [API Endpoint](https://blood-management-api.onrender.com)

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm start
```

### Frontend Setup
```bash
cd frontend/blood-management-frontend
npm install
npm run dev
```

## 🌐 Deployment

This project is configured for easy deployment on:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

See `DEPLOYMENT_INSTRUCTIONS.md` for detailed deployment guide.

## 📧 Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=your_frontend_url
```

### Frontend (.env)
```
VITE_API_URL=your_backend_api_url
VITE_APP_NAME=Blood Management System
VITE_APP_VERSION=1.0.0
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Quick Link**
- GitHub: [@quick767](https://github.com/quick767)
- Email: quicklink812@gmail.com

## 🙏 Acknowledgments

- Thanks to all blood donors who save lives every day
- Built with modern web technologies for reliability and performance

---

**⭐ If this project helped you, please give it a star!**