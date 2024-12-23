# Containers

## Open Container Initiative (OCI)
1. Purpose: The OCI sets open industry standards for container formats and runtimes.
    * Image specification: Defines how container images are packaged.
    * Runtime specification: Defines how containers are started, stopped, and managed.
2. Implementations:
* runc: Provides a low-level CLI wrapper around libcontainer to directly run OCI-compliant containers.
    * Lightweight but “bare bones” compared to Docker’s API.
* containerd: Added support for OCI-compliant images, converting Docker images to OCI bundles under the hood.

## Docker Architecture
* Docker CLI: User-facing command-line tool that sends requests (e.g., docker run).
* Docker Daemon (dockerd): Implements the Docker engine. Receives CLI requests, manages container life cycles using containerd.
* containerd: A simpler daemon that handles the actual container lifecycle tasks and communicates with runc.
    * Manages containers, images, volumes, and networks.
    * Exposes an HTTP/gRPC API.
* runc: The low-level runtime for spawning and running containers via Linux kernel features (namespaces, cgroups, etc.).
* Shim: A daemonless stub process left after runc starts a container; it lets the container keep running independently if Docker upgrades or restarts.

## Linux Kernel Features Underlying Containers 
### Namespaces
* Goal: Provide isolation of resources so that each container sees only its own environment.
* Types of Namespaces (seven total; cgroups is separate):
    * mnt – Isolates mount points/filesystems.
    * pid – Provides independent process IDs (PID 1 inside the container).
    * ipc – Separates inter-process communication (shared memory, semaphores).
    * user – Separates user IDs and privileges across containers.
    * net – Virtualizes network stack (e.g., multiple lo interfaces).
    * uts – Splits host and domain name (UNIX time sharing).
    * cgroups – Often listed separately; manages resource usage limits.

### Control Groups (cgroups)
* Purpose: Group-level resource allocation, limiting, prioritization, accounting, and process control.
    * Resource limiting (e.g., memory, disk cache).
    * Prioritization (e.g., CPU shares, I/O throughput).
    * Accounting (e.g., track usage for billing or scheduling).
    * Control (e.g., pause/resume processes, checkpoint/restore).
* Hierarchy: Child groups inherit parent resource constraints.
* Controllers: (e.g., “memory” to limit memory usage, “cpuacct” to track CPU usage).
* cgroup filesystem: Typically mounted at /sys/fs/cgroup; can browse container resource usage there.

### seccomp (Secure Computing)
* Definition: A kernel mechanism (since version 3.12) that restricts the set of system calls a process can make.
* Purpose: Prevent a compromised container process from invoking “dangerous syscalls,” thus mitigating potential kernel exploits.
* Profiles:
    * Typically use a “denylist” or “allowlist” approach, often referred to as seccomp “profiles.”
    * Docker applies a default seccomp profile by default but supports custom profiles

### Linux Security Modules (LSM)
* Goal: Provide additional mandatory access controls (MAC) to confine processes and files.
* Common Examples:
    * SELinux: (Red Hat) Labels files and processes; an SELinux policy determines which process types can access which resource types.
    * AppArmor: (Canonical) Uses policy “profiles” that define file paths, system calls, and other resources processes may access.
* Container Use Case:
    * Prevent containers from reading areas of the host filesystem or other containers’ data.
    * Docker, Podman, and other engines integrate with SELinux/AppArmor profiles.

## Docker Architecture and Components
![alt text](image-1.png)
![alt text](image-2.png)

### Docker Engine (Client-Server Model)
* Docker CLI: User-facing command-line tool (docker build, docker run, etc.).
* Dockerd (Docker Daemon): Receives CLI requests over HTTP, manages the lifecycle of containers.
* containerd: A separate daemon that handles lower-level container operations (create, start, stop), exposing an API to dockerd.
* runc: The default container runtime for Docker; sets up namespaces, cgroups, seccomp filters, LSM constraints, etc., then forks the container process.
* containerd-shim: A small process that remains after runc creates the container. It keeps the container running if dockerd or containerd restarts.

### Docker’s Container Creation Flow
1. Docker CLI → sends a request to dockerd.
2. dockerd → calls containerd to create the container.
3. containerd → converts Docker images to OCI-compliant bundles, hands them off to runc.
4. runc → performs the namespace/cgroup setup in the kernel and starts the container’s entrypoint process.
5. Shim remains after runc exits to maintain the container process’s I/O, exit codes, etc.

### Overlay Filesystems (OverlayFS / AUFS)
* Union File System: Combines multiple read-only layers and one top-level writable layer into a single mount.
    * Copy-on-write: Modified files get copied to the writable layer; unmodified files remain in the read-only layers.
* Docker Usage:
    * Historically used AUFS, now commonly overlay2.
    * Minimizes duplication across images/containers.

## Overlay Filesystems (Overlay FS)
* Concept: A union mount filesystem that combines multiple read-only layers with one writable layer.
* Docker Usage:
    * Commonly uses overlay2.
    * Copy-on-write: Only modified files are copied to the top writable layer, reducing duplication.
    * Layered file systems present a single merged filesystem view to the container.

## Container Runtimes
* Definition: A piece of software that translates user-facing container specs into actual kernel-level isolation (namespaces, cgroups, seccomp, etc.).
* Common Approaches:
    * Native Runtimes (e.g., runC): Container shares the host kernel directly.
    * Sandboxed Runtimes (e.g., gVisor): Interposes a kernel “proxy” to implement syscalls, reducing direct host kernel exposure (not all syscalls are supported).
    * Virtualized Runtimes (e.g., Kata Containers): Runs containers inside lightweight VMs (Firecracker, QEMU). Highest isolation, some performance overhead.

## Container Isolation
* Host vs. Container: Namespaces, cgroups, seccomp, and LSMs keep containers isolated from the host’s system resources and files.
* Inter-Container Isolation: Each container is in its own set of namespaces and cgroups; additional constraints can be added with SELinux/AppArmor policies.
* Defense-in-Depth: A combination of user namespaces, seccomp profiles, LSM policies, and minimal container runtimes (like gVisor or Kata for extra security) strengthens isolation.

## Image Layers
* Docker container images are built incrementally. Each step in the Dockerfile creates a new read-only layer, which is stacked on top of the previous layers.
* Each layer has its own 256-bit hash (a content-based identifier).
Docker provides commands such as docker history and docker image inspect to reveal how many layers an image contains and what commands generated each layer.
* Layers are cached and shared among containers. For instance, if multiple images use the same base image layer, Docker only stores it once, improving efficiency in disk usage and build time.