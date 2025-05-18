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
