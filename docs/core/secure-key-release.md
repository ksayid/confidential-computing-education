---
title: Secure Key Release
layout: default
---

[← Back to Main Page]({{ "/" | relative_url }})

* TOC
{:toc}


# Secure Key Release
## Key Management System (KMS)
A KMS is a piece of software that performs cryptographic operations (such as encryption and managing private keys). It is usually embedded inside a secure hardware component or inside hardware security modules (also referred to as HSMs).

For instance, let's take a running web application: a particular attention must be given to passwords and credit card details when storing them. Usually, these issues are resolved by encryption.

For the encryption to be secure, the key to decrypt must be stored securely, and that key must be encrypted by another key to protect it.

This key chain can quickly become quite complicated, especially in company setting. But at the root of the concept, there is always going to be a master key that we must securely store, and it cannot be done by simply encrypting it.

This where a KMS comes in handy. One of its features is to manage keys: it will import them, manage the users and the roles, etc. It will do so in a secure and protected way, completely isolated from the services that use it. That is because KMSs can perform multiple cryptographic operations. They can store private keys and certificates, perform encryption and key rotation...

Attester — The Attester is the entity which informs the relying party of the state of the system by sending evidence. The evidence informs the relying party about the state of the system, the Trusted Computing Base (the part of hardware, firmware and software that is trusted) and other aspects of the system. The evidence comprises a set of claims, later asserted or denied by the verifier. The evidence is cryptographically signed with a key (e.g. coming from the silicon vendor) that is used during the verification process.

If you are looking for a deep dive into the attestation flows and how they differ between different vendors, I would recommend reading this paper — https://systex22.github.io/papers/systex22-final79.pdf

Relying Party/Key Broker Service (KBS) — The KBS is the relying party and the following are its primary function:

Receives evidence from the attester (confidential VM or container) via challenge-response protocol
Relay the evidence to the Attestation Service (Verifier) for verification.
Apply appraisal policy for the returned Attestation Results to assess the trustworthiness of the attester.
Interact with Key Management Service to retrieve the keys and send them to the attester
Verifier (Attestation Service) — The Attestation service verifies the evidence, based on configured policy and reference values. Think of reference values as “good” and “trusted” values which are known beforehand and used for verification of the evidence sent by the attester. These reference values are typically generated when building the system software and firmware layers, through a coupled CI/CD pipeline.

Key management service — A service for securely storing, managing, and backing up cryptographic keys used by applications and users.

## Secure key release sidecar
Confidential containers on Azure Container Instances provide a sidecar open source container for attestation and secure key release. This sidecar instantiates a web server, which exposes a REST API so that other containers can retrieve a hardware attestation report or a Microsoft Azure Attestation token via the POST method. The sidecar integrates with Azure Key vault for releasing a key to the container group after validation has been completed.

<script src="{{ '/assets/js/dark-mode.js' | relative_url }}"></script>
