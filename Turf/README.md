# Turf Management System

A full-fledged turf booking and management system built with HTML, CSS, JavaScript, and Firebase.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Firebase CLI
- Git

### Installation

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Initialize Firebase:**
   ```bash
   firebase init
   ```
   Select:
   - Hosting
   - Firestore
   - Authentication
   - Functions

4. **Start Development Server:**

   **Windows:**
   ```bash
   start-dev.bat
   ```

   **Mac/Linux:**
   ```bash
   chmod +x start-dev.sh
   ./start-dev.sh
   ```

   **Manual Command:**
   ```bash
   firebase emulators:start --only hosting,firestore,auth,functions --port 3000
   ```

## 🌐 Access Your Application

- **Local URL:** http://localhost:3000
- **Port:** 3000
- **Firebase Emulator UI:** http://localhost:4000

## 📁 Project Structure

```
Turf1/
├── home.html          # Main application page
├── login.html         # Login page
├── signup.html        # Registration page
├── frgtpssswd.html    # Password reset page
├── home.css           # Main styles
├── home.js            # Main JavaScript
├── index.css          # Auth page styles
├── script.js          # Auth page JavaScript
├── auth.js            # Firebase configuration
├── firebase.json      # Firebase configuration
├── firestore.rules    # Database security rules
├── functions/         # Firebase Functions
└── start-dev.bat      # Windows start script
```

## 🔧 Configuration

1. **Update Firebase Config in `auth.js`:**
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

2. **Set up Email Configuration:**
   ```bash
   firebase functions:config:set email.user="your-email@gmail.com" email.pass="your-app-password"
   ```

## 🚀 Deployment

1. **Deploy to Firebase Hosting:**
   ```bash
   firebase deploy
   ```

2. **Deploy Functions:**
   ```bash
   firebase deploy --only functions
   ```

## 📱 Features

- ✅ User Authentication (Email/Password, Google)
- ✅ Turf Slot Booking
- ✅ Real-time Slot Availability
- ✅ Payment Integration (Razorpay)
- ✅ Admin Dashboard
- ✅ Email Notifications
- ✅ Mobile Responsive Design
- ✅ Firebase Functions for Backend Logic

## 🔐 Admin Access

- **Email:** shaikhmdaseel@gmail.com
- **Password:** Aseel@123

## 📞 Support

For support, email: support@turfmasterpro.com

## 📄 License

This project is licensed under the MIT License.
