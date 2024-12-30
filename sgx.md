After giving this some additional thought, I am not entirely convinced that running an existing application, like the one from my scenario, in a containerized SGX-powered wrapper is a wise idea. Let me explain.

The solutions I’ve encountered typically employ something akin to a library OS, which is an operating system implemented as a library. This setup allows your application to make Linux system calls as usual. However, behind the scenes, the library OS intercepts those calls and executes its own implementation of the syscall. Running the syscall inside an SGX enclave is not always possible or does not always behave the same as against a ‘normal’ Linux kernel, which is why they have their own specific implementation that works inside of SGX. For instance, working with networking syscalls within SGX is quite tricky and often requires unconventional methods. So, unless you are prepared to invest the effort to port and extensively test your application under various constraints, it appears uncertain whether an existing (legacy) app will behave as expected.

Unfortunately, none of these solutions seemed to fit my fictional, yet-not-so-entirely-uncommon scenario. Since I had limited time to experiment, I concluded after a few days of testing that I should explore an entirely different solution… Though the solution would have to offer similar protections to what SGX offers, while taking away the complexities of SGX.

This would also imply that unless our application demanded the most conservative type of trusted computing base (for example, if we were building a key management service or similar), we would need to accept a TCB that is considerably larger than what SGX would have provided.

### SGX Fundamentals
An Intel SGX enclave is a protected region of memory in a process, whose content is encrypted in RAM. The CPU provides hardware checks so that only trusted code inside this region can read and write the data. Even if an attacker has root access to the OS, direct memory reads from enclave regions will show only ciphertext. This design is used to protect sensitive computations and data from tampering or leakage.

Because the enclave is isolated, you can’t just call into it with a normal function pointer. You have to carefully marshal data in and out, specifying which parameters remain inside, which can be read, which can be written, etc. This helps minimize the attack surface and keep data inside the enclave private.
* Enclave Calls (ECalls) allow the application to call a pre-defined function inside the enclave.
* Outside Calls (OCalls) allow the enclave to call a pre-defined function in the application. It is best practice to keep the amount of Ocalls as low and as controlled as possible. A misuse of an external function on a Ocall can leak or write enclave data if not properly implemented.

Since enclaves need a well-defined interface for ECalls and OCalls, Intel SGX (and Open Enclave) uses EDL files, which are basically declarations of functions (like function prototypes in C) that specify:
* Which functions are trusted (ECalls).
* Which functions are untrusted (OCalls).
* The direction of data (e.g., [in], [out], [in, out]).
* Any special attribute or buffer boundary.
