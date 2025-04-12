
# Smart Contract Based Land Registry System using Ethereum Blockchain

![Land Registry](https://github.com/thisisvarun/LandMine.git)

## Abstract

This project is a decentralized application built using Blockchain technology to address the shortcomings of the traditional land registry process. Blockchain enables tracking property ownership changes, providing immutability, auditability, traceability, and anonymity. This system simplifies the transfer of land ownership between buyers, sellers, and government registrars without intermediaries. It accelerates the registration process, ensures transparency, and reduces fraud.

## Technologies Used

- ReactJS
- NodeJS
- MongoDB
- Solidity
- Truffle
- Ganache
- Metamask

## Prerequisites

### Install Node.js
Download and install Node.js from [Node.js Official Website](https://nodejs.org/en/).

### Install Truffle
Install Truffle globally using the following command:
```bash
npm install -g truffle
```

### Install Ganache
Download and install Ganache from [Ganache Official Website](https://trufflesuite.com/ganache/).

### Install Metamask Chrome Extension
Install the Metamask extension from [Metamask Chrome Web Store](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en).

### Create a MongoDB Atlas Account
Sign up for MongoDB Atlas at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

## Getting Started

Follow these steps to set up and run the project:

1. **Clone the Repository**
    ```bash
    git clone https://github.com/thisisvarun/LandMine.git
    ```
2. **Navigate to the Project Directory**
    ```bash
    cd LandMine
    ```

3. **Install Dependencies**
    ```bash
    npm install
    ```

4. **Start Ganache**
    Open Ganache and configure it to use a local Ethereum blockchain.

5. **Compile Smart Contracts**
    ```bash
    truffle compile
    ```

6. **Deploy Smart Contracts**
    ```bash
    truffle migrate
    ```

7. **Start the Frontend**
    ```bash
    npm start
    ```

8. **Set Up the Backend**
    - Open a new terminal and navigate to the `Server` folder:
      ```bash
      cd Server
      ```
    - Install backend dependencies:
      ```bash
      npm install
      ```
    - Navigate to the `Config` folder:
      ```bash
      cd backend/Config
      ```
    - Update the database credentials in `db_config.js`.

9. **Start the Backend Server**
    ```bash
    npm start
    ```

10. **Register Government Registrar**
     Open another terminal and execute the following command to add the government registrar details to the database:
     ```bash
     curl -X POST http://localhost:3000/register_govt
     ```

11. **Login Credentials for Government Registrar**
     - **Username:** admin  
     - **Password:** admin123

## Workflow

### Registration of Users and Property
1. Visit `http://localhost:3000/signup` to register on the platform.
2. After registration, log in using your private key.
3. To register a property, navigate to the **Register Land** tab, fill in the property details, and submit the form. The application will be verified by the government authority.

### Validation by Government Authority
- The government authority audits the land details and approves or rejects the application.
- Users must upload legal land documents for verification.
- Notifications about the application's status are sent via email and SMS using NEXMO API and Nodemailer API.

### Transaction Between Parties
1. **Making the Land Available**  
    Once approved by the government, the landowner can make their property available for sale.
2. **Sending Purchase Requests**  
    Buyers can send purchase requests to landowners from the available properties section.
3. **Processing Requests**  
    Landowners review requests and decide whether to accept or decline them.
4. **Completing the Transaction**  
    Upon approval, the buyer pays for the property, and ownership is transferred via a smart contract. The transaction is secure, immutable, and transparent.

## Features
- Decentralized and secure land registry system.
- Transparent and immutable transactions.
- Notifications via email and SMS.
- Reduced paperwork and fraud prevention.

## Contact

For any queries, feel free to contact me at:  
**Email:** varunthurram1@gmail.com

