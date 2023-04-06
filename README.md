https://faucet.paradigm.xyz/

# Required Technology
- Redis
- Postgres

# Steps to run locally
 - npm i 
 - npm run start:dev

# Api Doc (Swagger) 
  endpoint: http://${baseUrl}/api/v1/


# Technical Overview
  The architecture of this system is based on an Async Event Driven Architecture.
  To ensure system durability and reduce latency incoming transactions are pushed to a QUEUE and processed by Workers/Consumers. Before a transaction is pushed to the queue it goes through a series of checks to ensure that the transaction is valid and safe from input errors .
  When the Transaction gets to the Queue the consumers work on sending the request to the blockchain and emitting transaction status.


# Additionals Resources
  Here are some of the features added to the basic requirement:

  - Wallet: Need to new create wallet or use existing wallet , provides baseline for security using web3 wallet encryption.
  
  - Security with Auth: After setting up wallet with the system ,users can login with thier passphrase so that on subsequent requests they wont need to pass in thier privatekey to send transactions. 

  - Encrypted Transaction: After Initial wallet setup no privatekey is needed to send transaction and accounts saved on the system are encrypted.



# Api Walkthrough

- ## Test Feature Without Wallet Setup 
  
    You can interact with the system without setting up a wallet

    Send Transaction (Here you need to pass in a private key)
    http://${baseUrl}/api/v1/transactions

- ## Test Features Wallet Setup 
    -  Setup of wallet  new or exisiting
        New:http://${baseUrl}/api/v1/wallets/create-new-wallet
        Exisiting:http://${baseUrl}/api/v1/wallets/setup-exisitng-wallet
    
    - After setup the system logins your wallet in automatically
    - If session expires you can login with your passphrase 
        endpoint: http://${baseUrl}/api/v1/authentication/
    
    - Send Transaction
      endpoint: http://${baseUrl}/api/v1/transactions/with-private-key-encryption
      you need to be authorized/logged in to use this endpoint.


# Test coverage
 - npm run test:cov

# Useful links

Below are links to previous blockchain projects i have worked on.
[Github](https://github.com/grincodes/Zenof-City)
[ZenofCity website](https://www.zenofcity.com/)





