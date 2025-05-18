---
title: Confidential Containers
layout: default
---

[← Back to Main Page]({{ "/" | relative_url }})

* TOC
{:toc}


# Confidential Containers

Confidential Containers extend familiar container workflows with hardware-based
protection for data **in use**. Instead of running directly on a shared host
kernel, each container—or group of containers—executes inside its own
lightweight virtual machine backed by a Trusted Execution Environment (TEE).
This ensures the container's memory is encrypted and isolated from the host
operating system and hypervisor, thwarting snooping by even highly privileged
attackers.

By combining the portability of containers with the security of confidential
computing, platform operators can offer stronger guarantees around privacy and
integrity. Remote attestation allows workloads to prove they are running in an
approved environment before secrets or keys are released. The result is a
familiar container experience with defense-in-depth protections well suited for
sensitive or multi-tenant scenarios.

## Key Building Blocks

* **Hardware isolation** – Technologies such as AMD SEV-SNP and Intel TDX
  encrypt guest memory and provide attestation reports that prove the VM's
  integrity.
* **Container runtimes** – Projects like Kata Containers and the `cc-runtime`
  launch pods inside small VMs to take advantage of the underlying TEE
  capabilities.
* **Policy enforcement** – Integrations with tools like Open Policy Agent (OPA)
  let operators define fine-grained rules for what a confidential pod may do
  once running inside the TEE boundary.

## Azure Container Instances
### Key Technology
#### LCOW (Linux Containers on Windows)
* What is LCOW? LCOW allows running Docker containers on Windows by hosting a minimal Linux VM (often called a “utility VM”) under the covers. This VM runs the actual Linux containers, providing a real Linux kernel and userland.
* Why it Matters
  * LCOW can provide an isolated Linux environment on a Windows host.
  * Combining LCOW with confidential computing features (e.g., AMD SNP) can enable “confidential containers” that run inside an encrypted environment.

#### AMD Secure Nested Paging (SNP)
* What is AMD SNP? AMD SNP is a feature of AMD’s EPYC processors (starting with 3rd Gen Milan) that encrypts a VM’s memory and provides attestation.
  * Memory Encryption: The memory of the VM is encrypted by hardware.
  * Attestation: The hardware can produce an attestation report demonstrating the VM’s integrity and configuration.
* Why it Matters? 
  * Ensures data in the VM is protected from outside threats, including a potentially malicious hypervisor or root user on the host.
  * Provides cryptographic proof that the VM’s memory contents have not been tampered with.

### High-level Design
1. LCOW + AMD SNP
  * LCOW provides a lightweight Linux VM for running containers.
  * AMD SNP provides memory encryption and attestation for that VM.
2. Ephemeral Disk Encryption
  * A scratch read-write disk is protected by a combination of dm-crypt and dm-integrity attached via SCSI.
  * The dm-crypt key is created inside the TEE/VM and is not preserved across VM lifecycles (ephemeral storage).
  * OverlayFS can use this ephemeral storage for the top writable layer in a container’s root filesystem.
3. Result
  * You get a Linux environment (“utility VM”) that is both fully functional for containers and protected by hardware-based encryption.
  * The ephemeral nature of the disk ensures that sensitive data won’t persist once the VM/container is torn down.

<script src="{{ '/assets/js/dark-mode.js' | relative_url }}"></script>
