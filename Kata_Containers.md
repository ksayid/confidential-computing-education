# Kata Containers
**Kata Containers** is an open-source project providing lightweight virtual machines (VMs) with the agility and speed of traditional containers. By merging hardware virtualization and containerization, Kata offers stronger isolation while retaining near-native performance. It originated from two projects:
* **Intel Clear Containers**, which introduced lightweight VMs tailored for container security.
* **Hyper-V runV**, which prioritized being technology-agnostic by supporting many different CPU architectures and hypervisors.

![alt text](image.png)

## Key Advantages and Features
1. Lightweight VMs with Container Performance
    * Each container runs inside its own minimal VM, leveraging a lean guest OS and kernel.
    * Near-native performance similar to Docker or Kubernetes containers.
2. Enhanced Security and Isolation
    * Relies on hardware virtualization provide a clear boundary between host and container.
    * Minimizes the risk of container breakouts that might compromise the host or other containers on the same system.
3. Compatibility with Container Ecosystems
    * Works with standard container interfaces (OCI-spec containers, CRI for Kubernetes), making it easy to integrate Kata Containers into existing CI/CD pipelines and orchestration tools.
    * Future extensions include allowing Kubernetes to provision these lightweight VMs automatically and enabling OpenStack Nova to manage containers via the same orchestration engine that manages regular VMs.
4. Minimal Overhead
* The lean kernel and stripped-down guest operating system reduce memory and CPU overhead when compared to traditional full-blown VMs.

# Kata Confidential Containers
Kata Confidential Containers build on Kata’s lightweight VM approach by adding hardware-based Trusted Execution Environments (TEEs). These TEEs encrypt and isolate workloads at runtime, preventing both external and internal threats (including the host) from accessing sensitive data.

## Hardware-Enforced Confidentiality
1. Uses technologies like Intel Trust Domain Extensions (TDX) or AMD Secure Encrypted Virtualization (SEV) to create a secure “enclave” within the VM.
    * Data remains encrypted in memory, protected from host-level attacks or other containers.
2. KVM Boundary for Kubernetes
    * Places a KVM-based boundary between the Kubernetes node and the containerized application, mitigating the risk of a container breakout targeting the Kubernetes node.
    * Protects pods from host-originating threats or unauthorized monitoring.
