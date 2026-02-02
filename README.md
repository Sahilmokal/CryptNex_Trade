CryptNex Trade

CryptNex Trade is a full-stack crypto trading web application built to simulate real-world cryptocurrency trading and payment workflows. The application includes user and admin functionality along with an AI-powered chatbot for viewing stock and crypto-related information.

Tech Stack

Frontend
React.js
Vite
TailwindCSS

Backend
Java / Spring Boot
Node.js (for supporting services)

Database
Mysql

Payment & Integrations
Stripe (test mode)
AI chatbot for stock and crypto details
Environment variable–based secret management

Main Features

User Side
User registration and login
View crypto assets and prices
Simulated buy and sell of crypto
Wallet balance tracking
Online payments using Stripe (test mode)

AI Chatbot
AI-based chatbot for stock and crypto details
Provides price information and basic market insights
Integrated as a separate chatbot module

Admin Side
Admin panel to manage users
View trades and transaction history
Monitor platform activity

Backend Features
REST APIs for trading operations
Secure handling of secrets using environment variables
Payment processing via Stripe
Separation of frontend, backend, and chatbot services

Project Structure

Project02/
backend/
frontend/
chatbot/
README.md
.gitignore

Running the Project Locally

Clone the repository
git clone https://github.com/Sahilmokal/CryptNex_Trade.git

Backend
Go to backend folder
Configure environment variables
Run the backend server

Frontend
Go to frontend folder
Install dependencies
npm install
Run the frontend
npm run dev

Chatbot
Go to chatbot folder
Install dependencies
Start the chatbot service

Environment Variables

All sensitive values such as database credentials and Stripe keys are managed using environment variables and are not committed to the repository.

Example:
STRIPE_SECRET_KEY=your_test_key
MONGO_URI=your_database_url

Notes

This project follows secure coding practices.
Secrets are protected using GitHub push protection.
The project is built for learning and demonstration purposes.

Purpose of the Project

This project was developed to gain practical experience in full-stack development, crypto trading workflows, AI chatbot integration, and secure backend configuration.
