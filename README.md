# Confidential Computing Notes
This repository contains my personal notes, resources, and explorations related to confidential computing, compiled from my experiences as a software engineer at Microsoft. I've organized these learnings into Markdown files focusing on key concepts and technologies that power confidential computing in the cloud. By organizing this knowledge in a single place, I can track my growth and hopefully help others explore confidential computing.

Some topics include:
* Trusted Execution Environments
* Confidential Containers/VMs
* Kubernetes
* Attestation Protocols

> [!NOTE]
> All opinions and explanations in this repo are my own and do not necessarily reflect the official stance of Microsoft or Azure.

## What is Confidential Computing?
Confidential Computing is all about protecting sensitive data while in use. It leverages hardware-based Trusted Execution Environments (TEEs) to ensure data, application code, and machine learning models remain secure even when attackers have full privileges on a system. As enterprise data moves off-premises into the cloud, confidential computing is becoming a crucial part of building zero-trust architectures.

## Repository Structure
All documentation now lives under the `docs/` directory. Content is grouped by
topic so new contributors can easily find the appropriate location.

```
docs/
├── core
├── containers
├── tools
├── misc
├── img
└── assets
```

## License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
