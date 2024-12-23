Confidential computing (CC) refers to technologies and practices that isolate and protect data during processing, preventing unauthorized access—even by the owner of the hardware or a cloud service provider (CSP). This is primarily achieved using trusted execution environments (TEEs) and associated security mechanisms such as attestation, secure boot, and robust key management.

## Trusted Execution Environment (TEE)
A **TEE** is a secure and isolated environment within a computer system where sensitive data and code can be processed in a protected and confidential manner. 
* Isolation: The TEE’s memory is segregated from the rest of the system, preventing unauthorized access or tampering.
    * Example: Intel SGX enclaves allocate a region of memory (Enclave Page Cache) that is encrypted and cannot be read or modified by other system processes.
* Hardware or Software: TEEs can be implemented in hardware (e.g., Intel SGX, AMD SEV, Arm TrustZone) or software hypervisors.
    * Example: AMD SEV (Secure Encrypted Virtualization) encrypts each VM’s memory with distinct keys to isolate them from the hypervisor.

## Secure Enclave
A **secure enclave** is a hardware-based implementation of a TEE. It typically:
* **Runs on CPU hardware**: Intel SGX, Apple Secure Enclave, etc.
    * Example: Apple’s Secure Enclave on iPhones is used for fingerprint or face data; it stores biometric data in a separate chip region inaccessible to the main CPU OS.
* **Provides strict isolation**: Protects code and data from other processes, including privileged system processes.
    * Example: Intel SGX enclaves allow only encrypted reads by the CPU microcode, so even the OS kernel cannot inspect enclave memory.
* **Broader vs. narrower**: A TEE can be software-based, whereas a secure enclave is specifically hardware-enforced.

## Trusted Computing Base (TCB)
The **TCB** is the collection of hardware, software, and firmware components essential for enforcing a system’s security policies.
* **Critical for security**: Weaknesses or vulnerabilities in the TCB compromise the entire system’s integrity.
    * Example: If a hypervisor that’s part of the TCB has a critical bug, an attacker could potentially compromise every virtual machine.
* **Size matters**: Smaller TCBs are easier to audit and reason about.
    * Example: A single monolithic kernel is a large TCB, whereas a microkernel with minimal components is a much smaller TCB.

## Attestation
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
* Example: A CRM platform that “optionally” uses enclaves for especially sensitive customer data but does not exclusively rely on them.
