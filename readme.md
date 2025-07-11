# 📽️ Full Stack Video Platform Backend

A powerful backend for a full-fledged video-sharing platform built with Node.js, Express, MongoDB, and Cloudinary. It handles everything from user authentication to video uploads, playlists, likes, subscriptions, and much more.

## 🔥 Features

- JWT Authentication (Access + Refresh Tokens)
- Cloudinary File Uploads (Thumbnail + Video)
- Video CRUD with pagination, filters, sorting
- Likes / Subscriptions / Comments / Playlists
- User profile with avatar & cover image updates
- Postman-tested REST API
- MongoDB Aggregations for advanced queries

## ⚙️ Tech Stack

- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **Cloudinary** for file uploads
- **JWT** for authentication
- **Multer** for file handling
- **Postman** for API testing

## 🗂️ Folder Structure

```
├── src
│   ├── controllers/         # Business logic of each route
│   ├── middlewares/         # JWT, error handling, file handling
│   ├── models/              # Mongoose schemas (User, Video, Comment, etc.)
│   ├── routes/              # All Express routes
│   ├── utils/               # Utility files (Cloudinary logic, error handlers, etc.)
│   ├── index.js             # Entry point
│   └── app.js               # Express App config
├── .env                     # Environment variables
├── .gitignore               # Files to be ignored by Git
├── package.json             # Project metadata and dependencies
```

## 📦 Installation

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
npm install
```

## 🧪 Run the Server

```
npm run dev
```

## 🔐 Environment Variables

Create a `.env` file in the root with the following:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📮 API Testing

All routes have been tested with **Postman**. You can import the collection and start playing around.

## 🌐 Deployment

This backend is live and deployed on Render:
[Video-Tube](https://video-tube-fmq4.onrender.com)
(You no longer need to run the server locally — just use this live URL in your frontend or Postman).


## 💻 Contributions

Feel free to raise issues or submit PRs to improve the project.

## 🧑‍💻 Author

Made with ❤️ by Kartik Garg
Github:[Github](https://github.com/kartik0905)
LinkedIn:[LinkedIn](https://www.linkedin.com/in/kartik-garg-23a995282?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app)

## 🙏🏻 Acknowledgment

A Big Thanks To Hitesh Sir [Chai aur Code](https://www.youtube.com/@chaiaurcode) for this wonderful journey of learning this project and backend.
