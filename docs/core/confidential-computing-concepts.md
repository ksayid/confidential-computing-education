---
title: Confidential Computing Concepts
layout: default
---

# Confidential Computing Concepts
**Confidential computing** refers to technologies and practices that isolate and protect data during processing, preventing unauthorized access—even by the owner of the hardware or a **cloud service provider** (CSP). This is primarily achieved using **trusted execution environments** (TEEs) and associated security mechanisms such as attestation, secure boot, and robust key management.

## Goals
### Confidentiality
* **Protection of data at rest and in transit**: Encryption ensures data remains protected even if intercepted.
    * Example: Encrypted database backups in an S3 bucket plus TLS-encrypted connections for data in transit. 
* **Isolation of computations**: TEEs ensure that sensitive code and data remain inaccessible to privileged software layers or untrusted parties.
    * Example: In finance, an enclave may securely compute credit scores without exposing raw credit data to the bank’s system administrators.

### Integrity
* **Prevention of unauthorized modifications**: Cryptographic attestation, checksums, and secure boot help verify that only trusted software is running.
    * Example: A device uses secure boot to ensure only a signed operating system image can load. Any tampering with the bootloader is detected and aborts the boot process.
* **Secure boot**: Ensures the system boots with trusted firmware and software, guarding against malicious changes.
    * Example: Modern laptops that use UEFI Secure Boot check signatures of the OS loader.
* **Data integrity checks**: Use of hashes, digital signatures, and other mechanisms to detect tampering.
    * Example: A container image registry that checks each image’s SHA-256 hash against a known “golden” reference before deployment.

### Availability
* **Always accessible**: Systems should be designed to ensure continuous service (redundancy, load balancing, failover mechanisms).
    * Example: A microservices architecture on Kubernetes that automatically re-schedules failed pods to keep services running.
* **Fault tolerance**: Replication, clustering, and robust resource management help mitigate hardware failures or other disruptions.
    * Example: A distributed database like Cassandra replicates data across multiple nodes and data centers to survive localized outages.

## Concepts
### Trusted Execution Environment (TEE)
A **TEE** is a secure and isolated environment within a computer system where sensitive data and code can be processed in a protected and confidential manner. 
* **Isolation**: The TEE’s memory is segregated from the rest of the system, preventing unauthorized access or tampering.
    * Example: Intel SGX enclaves allocate a region of memory (Enclave Page Cache) that is encrypted and cannot be read or modified by other system processes.
* **Hardware or Software**: TEEs can be implemented in hardware (e.g., Intel SGX, AMD SEV, Arm TrustZone) or software hypervisors.
    * Example: AMD SEV (Secure Encrypted Virtualization) encrypts each VM’s memory with distinct keys to isolate them from the hypervisor.

### Secure Enclave
A **secure enclave** is a hardware-based implementation of a TEE. It typically:
* **Runs on CPU hardware**: Intel SGX, Apple Secure Enclave, etc.
    * Example: Apple’s Secure Enclave on iPhones is used for fingerprint or face data; it stores biometric data in a separate chip region inaccessible to the main CPU OS.
* **Provides strict isolation**: Protects code and data from other processes, including privileged system processes.
    * Example: Intel SGX enclaves allow only encrypted reads by the CPU microcode, so even the OS kernel cannot inspect enclave memory.
* **Broader vs. narrower**: A TEE can be software-based, whereas a secure enclave is specifically hardware-enforced.

### Trusted Computing Base (TCB)
The **TCB** is the collection of hardware, software, and firmware components essential for enforcing a system’s security policies. When we talk about a "trusted" computing base, we don't necessarily mean that the system is secure, but that these components are critical for the system’s security. They are the root of trust, because the system assumes they are secure enough to be trusted. We must, after all, start trusting somewhere. This is actually what defines a TCB and why it must be as minimal as possible.
* **Critical for security**: Weaknesses or vulnerabilities in the TCB compromise the entire system’s integrity.
    * Example: If a hypervisor that’s part of the TCB has a critical bug, an attacker could potentially compromise every virtual machine.
* **Size matters**: Smaller TCBs are easier to audit and reason about.
    * Example: A single monolithic kernel is a large TCB, whereas a microkernel with minimal components is a much smaller TCB.

### Attestation
**Attestation** is the process of verifying the integrity and authenticity of a TEE or secure enclave before performing sensitive operations.
* **Proof of legitimacy**: Demonstrates that the TEE is genuine and unmodified.
    * Example: When an application starts an SGX enclave, it requests a quote from the CPU. This quote can be sent to a remote verifier to confirm the enclave is legit.
* **Cryptographic**: Often involves digital signatures, certificates, or platform-specific endorsements.
    * Example: Intel SGX uses an Intel Attestation Service that signs an enclave’s measurement so a remote party can validate that the enclave matches expected software.

## Offerings in Confidential Computing
### Capability Level
* Direct use of chip-level CC features via OS/hardware interfaces.
* Example: Using Intel SGX instructions directly in your code via the Intel SGX SDK.

### SDKs
* Lower-level libraries or language-specific toolkits that enable CC features for developers.
* Example: The Open Enclave SDK that abstracts away hardware-specific details for TEE development.

### Platform Offerings
* Packaged solutions (VM capabilities, container/Kubernetes integrations) that incorporate CC capabilities under the hood.
* Example: Azure Confidential VMs with AMD SEV, which let you run standard workloads while getting memory encryption automatically.

### Packaged CC Offerings
* Specialized CC applications, products, or services (ISVs focused on confidential computing).
* Example: A secure machine-learning platform that processes encrypted training data in enclaves.

### Packaged Non-CC Offerings
* General-purpose applications or services that might use CC features from any of the above but are not strictly CC-focused.
* Example: A CRM platform that "optionally" uses enclaves for especially sensitive customer data but does not exclusively rely on them.

## Ideal requirements for a Trustworthy TCB
A cornerstone of Confidential Computing (CC) is having a well-defined trust model, which mandates a fully traceable and attestable TCB. The challenge: many CC vendors provide large and complex TCBs, making it difficult or impossible to verify each component.
* **Open Source**: Transparency enables community review and auditing, reducing the likelihood of hidden vulnerabilities.
* **Stability**: Frequent updates make comprehensive security reviews impractical, so stable codebases are preferred.
* **Security Audits**: All TCB components should undergo rigorous auditing to detect and patch vulnerabilities.
* **Attestation**: Each TCB component must be measured and verifiable during attestation, helping confirm that no unauthorized changes exist.

### Example Problem: UEFI/BIOS
Many cloud services provide UEFI/BIOS components for virtual machines, but these often are proprietary, unavailable for external audit, or otherwise excluded from the CC attestation chain. Moreover, "lift-and-shift" approaches—migrating entire VM images without modification—can bloat the TCB, muddying the chain of trust.

### Possible Solutions
* **Minimize the TCB:** Use specially crafted VMs or direct SDK integrations that explicitly include only necessary components.
* **Leverage Attestable Platforms**: Opt for platform or application offerings designed from the ground up to meet open-source, audit, and attestation requirements.

### Availability of First- or Third-Party Attestation
Even if the TCB itself is trustworthy, it must be attested (verified) by a party other than the system operator or cloud provider. Generally, there are two models:

1. **First-Party Attestation**
    * The workload owner runs an attestation server, verifying their own TEEs.
    * Keeps the CSP or hardware operator out of the trust chain.
2. **Third-Party Attestation**
    * A neutral, trusted entity performs the attestation.
    * Minimizes the risk of conflicts of interest and ensures an unbiased security assessment.

**Potential Conflict**: Relying on the CSP’s own attestation service can introduce a conflict of interest. Unless there is a legally separate business unit with its own governance, a single CSP acting as both the platform operator and the attestation authority can undermine the independence required for truly confidential workloads. Consequently, many enterprises prefer to use truly independent attestation—either run by themselves (first-party) or by a trusted, external third-party.