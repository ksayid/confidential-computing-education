## Offerings
* Capability level - direct use of chip capabilities via operating system interfaces
* SDKs - low-level, language-based use of CC
* Platform - a packaged offering such as VM capabilities, containers or Kubernetes integration
* Packaged CC offerings - applications, products and services provided by specialist ISVs.
* Packaged non-CC offerings - applications, products and services that make user of one or more of the above, but are not provided by specialist ISVs.

## TCB/UEFI & boot issues
In order to have the highest level of security and to have well-defined trust models, adopters of CC must be assured that they have a fully traceable and attestable Trusted Computing Base (TCB). This is problematic for any large TCB from any CC vendor, as all components of the TCB must be:
* Open source
* Stable
* Subject to community security audit
* Part of the attestation measurement and verification process.

A particular example of this is that cloud services typically provide UEFI and/or BIOS components as part of VM instances.  However, for CC cloud services supplying VM-based CC solutions, meeting the requirement for a fully traceable and attestable TCB is impossible where the CSP provides any components that are run within the TEE boundary unless those components meet the requirements above.  Work is ongoing to provide open-source components, but it is unclear whether the other requirements above will be met.

It is clear that CSPs are keen to encourage use of their CC offerings and providing mechanisms that are similar to existing (non-CC) clearly reduces friction, as customers can follow similar processes and even deploy existing VM images.  Unluckily, this promotes practices that are inimical to good CC practice, with large TCBs from “lift and shift” workloads compounding the issues with UEFI/boot components noted above.  Further, this waters down the messages around the benefits of CC as some of the core benefits that CC can offer are not present.

Alternative approaches to dealing with this issue revolve around use of specially crafted VMs (via, for instance, SDK integration) and use of platform or application offerings whose entire TCB meet the requirements noted above.

## Availability of 1st or 3rd party attestation
Attestation validation is only acceptable as a security assurance when it is performed by a party other than the owner and/or operator of the system performing the CC executions: in other words, the owner of the workload (1st party) or a trusted 3rd party.

It is clear that CSPs are keen to encourage use of the CC offerings, and providing attestation services themselves allows them to do so.  Unluckily, this promotes practices that are inimical to good CC practice.  Attempts to ease customers concerns by providing attestation services using notionally distinct business units is generally not considered helpful, as unless there is a clear and defined legal separation between the CSP and the business unit providing the attestation services, there is always the possibility of collusion, bringing the CSP into the trust domain from which it should be explicitly excluded for CC.

https://learn.microsoft.com/en-us/azure/confidential-computing/ 
https://app.slack.com/client/T08PSQ7BQ/C08PSKWQL
HCSHIM
https://confidentialcomputing.io/wp-content/uploads/sites/10/2023/03/CCC-A-Technical-Analysis-of-Confidential-Computing-v1.3_unlocked.pdf
https://fosdem.org/2024/events/attachments/fosdem-2024-2394-linux-on-a-confidential-vm-in-a-cloud-where-s-the-challenge-/slides/21181/slides_fosdem2024_vkuznets_k3pOduv.pdf
https://www.andrew.cmu.edu/course/14-712-s20/applications/ln/14712-l22.pdf
https://www.youtube.com/watch?v=53kf4LY5YdM
https://web.stanford.edu/class/ee380/Abstracts/150415-slides.pdf