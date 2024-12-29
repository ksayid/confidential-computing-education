# Secure Key Release
## Key Management System (KMS)
A KMS is a piece of software that performs cryptographic operations (such as encryption and managing private keys). It is usually embedded inside a secure hardware component or inside hardware security modules (also referred to as HSMs).

For instance, let's take a running web application: a particular attention must be given to passwords and credit card details when storing them. Usually, these issues are resolved by encryption.

For the encryption to be secure, the key to decrypt must be stored securely, and that key must be encrypted by another key to protect it.

This key chain can quickly become quite complicated, especially in company setting. But at the root of the concept, there is always going to be a master key that we must securely store, and it cannot be done by simply encrypting it.

This where a KMS comes in handy. One of its features is to manage keys: it will import them, manage the users and the roles, etc. It will do so in a secure and protected way, completely isolated from the services that use it. That is because KMSs can perform multiple cryptographic operations. They can store private keys and certificates, perform encryption and key rotation...