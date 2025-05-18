---
title: SGX
layout: default
---

[← Back to Main Page]({{ "/" | relative_url }})

* TOC
{:toc}


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

Remote attestation is a security mechanism that enables a remote entity to verify the integrity and authenticity of a system or application running on another machine. This mechanism can be used to ensure that the system or application is running in a trusted environment and has not been tampered with by a malicious attacker.

In Intel SGX, we achieve the remote attestation by generating a enclave report. That report is then used to generate the quote, which represents its signature.

The quote in Intel SGX represents a digitally signed attestation generated through a hardware and software configuration of a particular SGX enclave. It is the signature that gives proof of the integrity of the application and system (software and hardware evidence).

It is the quote (partly) that verifies the integrity of the code inside the enclave and that it's really an application enclave running with Intel SGX protections on a trusted Intel SGX platform.

How does it work?
In remote attestation, as explained by the Internet Engineering Task Force (IETF) team:

One peer (the "Attester") produces believable information about itself - Evidence - to enable a remote peer (the "Relying Party") to decide whether to consider that Attester a trustworthy peer or not. [Remote Attestation procedures] are facilitated by an additional vital party, the Verifier.

To sum up, remote attestation is a security mechanism used to ensure the integrity of a computing system and its software components. It works by verifying that a system has not been compromised by checking its hardware and software configurations against a trusted set of measurements.

The procedure for remote attestation typically involves three parties: the verifier, the attester, and the challenger. The verifier is the entity that wants to verify the integrity of the attester's system. The attester is the system being verified. The challenger is a trusted third party that provides the verifier with the necessary information to verify the attester's system.

The procedure works as follows:

The attester generates a set of measurements that describe its hardware and software configurations and sends them to the verifier.
The verifier then compares these measurements against a trusted set of measurements provided by the challenger.
If the measurements match, the verifier can be confident that the attester's system has not been compromised.
Intel SGX's approach to remote attestation is the same but there are too many details to cover to explain it here. If you are interested to learn more, we wrote an in-depth article about it that you can find here.

Luckily, Open Enclave has tried to simplify this approach to make their solution more usable, so we don't need to understand all the subtleties to continue!

Open Enclave's Attestation
The Open Enclave community tried to develop a way that's more friendly to the Remote attestation procedures (RATS) specifications. This resulted in an attestation API. This API gives a set of functions to generate reports, evidence, and handles all the attestation interface for us. The Open Enclave SDK uses the functions to get evidence and to verify it.

openenclave/enclave.h: contains Open Enclave SDK APIs for creating and managing enclaves which we've already used.
openenclave/attestation/attester.h: provides functions to perform remote attestation and to verify attestation evidence. We will need this for generating the evidence.
openenclave/attestation/sgx/evidence.h: defines structures and functions for attestation evidence, specifically for Intel SGX Enclaves.
openenclave/attestation/sgx/report.h: provides functions for generating reports that attest to the current state of an SGX Enclave.
The implementation
We will be implementing two different concepts to show the difference between two different possible implementations.

Generating the report inside the enclave. The usual implementation for Intel SGX, is to generate the running enclave's report, and sign it outside using the Quoting Enclave. (Quoting Enclaves are part of the five ***architectural** enclaves in charge of managing other enclaves by creating them, generating proofs, handling signatures and processor data...*) The signed quote is what the third-party will use to verify the validity of the enclave.

Generating an evidence. As defined by the IETF:

Evidence is a set of Claims about the Target Environment that reveal operational status, health, configuration, or construction that have security relevance.

In Open Enclave, we have the possibility to generate this evidence that is conform to the IETF RFC document. A verifier can then take this evidence and compute it's results even if the format is different (it can be a JWT, X.509 certificate or other).

AESM service and setup
To start, we'll only need to verify that the AESM service is up and running. It is necessary to contact the architectural enclaves, and achieve a functioning remote attestation.

To do that, we use service command :


$ sudo service aesmd status
● aesmd.service - Intel(R) Architectural Enclave Service Manager
     Loaded: loaded (/lib/systemd/system/aesmd.service; enabled; vendor preset: enabled)
     Active: active (running) since Tue 2023-04-11 11:27:11 UTC; 4 weeks 1 days ago
   Main PID: 764 (aesm_service)
      Tasks: 4 (limit: 9529)
     Memory: 18.6M
     CGroup: /system.slice/aesmd.service
             └─764 /opt/intel/sgx-aesm-service/aesm/aesm_service
If the service is active as presented, you good to go, else, you can try restarting the service :


$ sudo service aesmd restart
Evidence generation
The evidence generation process begins by retrieving the necessary information from the enclave. For that purpose, Open Enclave SDK has an enclave implementation that's dedicated.

The first function is oe_get_report. It creates a report to be used in attestation. It's important to note that the call must be done inside the enclave as it is specific to the platform (and each enclave in that sense).

The second one is oe_get_evidence, to generate the evidence.

Adding ecalls
We will be adding two different Ecalls.

get_report : will extract the report inside the enclave.
get_evidence_with_pub_key : will be generating the evidence.
To do so, we'll need to change our kms.edl file. In it, we'll define the Ecalls and add some structures that we will be working with:


// kms.edl
enclave {
// ...
    struct format_settings_t
    {
        [size=size] uint8_t* buffer;
        size_t size;
    };

    struct pem_key_t
    {
        [size=size] uint8_t* buffer;
        size_t size;
    };

    struct evidence_t
    {
        [size=size] uint8_t* buffer;
        size_t size;
    };

    struct message_t
    {
        [size=size] uint8_t* data;
        size_t size;
    };

    trusted {
        // Untrusted port
        public int set_up_server([in, string] const char* port, bool keep_server_up);

        // Extract the evidence from the enclave
        public int get_evidence_with_pub_key(
            [in] const oe_uuid_t* format_id, 
            [in] format_settings_t* format_settings, 
            [out] pem_key_t *pem_key,
            [out] evidence_t *evidence
        );


        // Extract the enclave's report and public key for the remote attestation
        public int get_report(
            [out] uint8_t **pem_key,
            [out] size_t *key_size, 
            [out] uint8_t **report, 
            [out] size_t *report_size
        );
    };

//...

}
Before we continue, you might have noticed that we used two types of parameter boundaries, [in] and [out], for the variables.

The difference between both is important to note:

The in boundary only copies the value of the pointer that has been given.
The out boundary allows the enclave to modify the value that was passed, meaning it can also modify the pointer.
This figure from the Intel WhitePaper explains how it works more precisely :

Inbound and Outbound boundaries

In the get_evidence_with_pub_key function, format_id and format_settings are just copied as is (meaning you can only use the value). Those two variables represents the settings that will passed on to the enclave to generate the right evidence (such as the ECDSA-key standard generation format).

This function adds the public key in PEM format and the report in the enclave and copies it in the four variables (hence the outbound out).

At this stage, our report is still in a raw format. We'll have to parse it so values are structured properly, according to the report structure defined by Intel. We'll use oe_parse_report to do so.

The name of that structure is a quote. Intel defines it as a signed report, that will be used to verify the platform. Technically, this quote is generated by the Quoting Enclave (which is one of the five architectural enclaves), which possesses the keys to sign the report. This quote is then used by the verifier to check that the format and the platform are correct.

We instantiate the QuoteGeneration object that parses the results in JSON (the code can be found at mini_kms/part_2/host/quoteGeneration.cpp).

We can complete the quote generation by add the following code to complete the quote generation:

1. Remote Attestation Theory
What Is It?
Remote attestation is the process by which one system (the attester) proves to another system (the verifier) that it is running in a trustworthy state.
This typically involves generating and sending a digitally signed “proof” (often called a quote, report, or evidence) to the verifier.
The verifier checks the proof against a trusted reference or known “good measurements” to decide whether to trust the attester.
The Three Roles
Attester – The system that wants to prove its trustworthiness, e.g., an SGX enclave.
Verifier – The entity that receives the attestation evidence, checks its signature, compares the measurements, and decides if the attester is trustworthy.
Challenger (or “Relying Party”) – In some designs, the Challenger is the ultimate recipient or user of the attestation result (sometimes the Verifier and Challenger are effectively the same).
2. Intel SGX Remote Attestation
Intel SGX Enclaves
Intel SGX enclaves are secure memory regions on Intel processors where code and data are protected from untrusted software (including privileged software like the OS).
A typical SGX remote attestation flow is:
Enclave creates a local report (an SGX data structure that includes MRENCLAVE, MRSIGNER, etc. plus optional “report data”).
Quoting Enclave signs that report to produce a quote.
Quote is verifiable by remote parties. They can confirm that:
The code is genuinely running inside an SGX enclave on real SGX hardware.
The code’s measurement (i.e., cryptographic hash representing the code inside the enclave) matches what they expect.
AESM Service
On an SGX machine, the AESM service (Intel’s Architectural Enclave Service Manager) must be running so your enclave can talk to Intel’s “architectural enclaves” (like the Quoting Enclave).
If AESM isn’t running, you can’t produce valid quotes.
You typically check its status with sudo service aesmd status. If it’s not running, do sudo service aesmd restart.
3. Open Enclave’s Approach to Attestation
What Is Open Enclave?
Open Enclave (OE) is a cross–platform SDK that abstracts away low-level SGX (and other TEE) details.
With OE, you can generate SGX-specific quotes or platform-agnostic “evidence” with a single API call.
Key OE APIs for Attestation
oe_get_report(...)

Generates an SGX “report” inside the enclave.
You can specify flags like OE_REPORT_FLAGS_REMOTE_ATTESTATION to produce a remote-attestable report (one that the Quoting Enclave can sign).
oe_get_evidence(...)

Generates an IETF-RATS–style “evidence” object with custom claims.
This function can be used to produce SGX ECDSA quotes (or other attestation formats) under the hood.
Embeds any custom data (e.g., SHA-256 hash of a public key) in the evidence.
oe_verify_report(...) / oe_verify_evidence(...)

Used on the verifier side to check that the signature and measurements are correct.
Why Use Open Enclave?
It abstracts away many SGX-specific details.
It allows for simpler code that’s also portable to other TEEs (TrustZone, AMD SEV, etc.).
It also aligns with the emerging IETF Remote Attestation Procedures (RATS) specifications.
4. Implementation Details (Based on the Provided Notes)
Below is an overview of the major components and the code structure outlined in the notes.

4.1 EDL and ECalls
In an SGX/Open Enclave application, enclave functionality is defined in an EDL file (e.g., kms.edl).
ECalls are functions callable from the untrusted (host) side into the enclave.
Example ECalls in the notes:
get_report(...)
get_evidence_with_pub_key(...)
These ECalls do the following:

get_report(...)

Generates a remote-attestable report (which can later be turned into a quote).
Returns the enclave’s public key and the raw bytes of the SGX quote (once the Quoting Enclave signs the report).
get_evidence_with_pub_key(...)

Generates an attestation evidence (IETF RATS format, still containing the SGX quote under the hood).
Also returns the enclave’s public key.
Potentially includes custom claims (e.g., hash of a public key or a string indicating “Attestation KMS example”).
4.2 Parameter Boundaries
EDL attributes like [in] or [out] on function parameters matter:
[in] means the host copies data into the enclave (enclave can only read it).
[out] means the enclave can write to that pointer, then the host can read the updated data.
Example from the EDL:

c
Copy code
public int get_evidence_with_pub_key(
    [in] const oe_uuid_t* format_id, 
    [in] format_settings_t* format_settings, 
    [out] pem_key_t *pem_key,
    [out] evidence_t *evidence
);
format_id and format_settings are read-only inside the enclave.
pem_key and evidence are used by the enclave to “return” the generated data.
4.3 Attestation Class and Flow
Inside the enclave, the notes propose a C++ class Attestation to handle the details of generating reports and evidence. Two key methods:

generate_attestation_evidence(...)

Optionally hashes some input data (e.g., your public key or some message) with m_crypto->Sha256(...).
Calls oe_attester_initialize() to set up attestation.
Builds a set of “custom claims” (e.g., {"Event": "Attestation KMS example", "Public key hash": <hash>}), then calls oe_serialize_custom_claims(...).
Calls oe_get_evidence(...) to produce a buffer containing the attestation evidence (signed SGX quote plus those custom claims).
Cleans up and returns a success/failure flag.
generate_report(...)

Hashes input data into a 32-byte SHA-256 array.
Calls oe_get_report(...) with OE_REPORT_FLAGS_REMOTE_ATTESTATION, passing that 32-byte hash as the “report data.”
The result is an SGX “remote report” that can later be turned into a quote by the Quoting Enclave.
Returns the raw bytes of that report to the caller.
4.4 Crypto Class
There’s also a Crypto class that does RSA or ECDSA operations, hashing, etc., likely using mbedTLS.
The code references m_crypto->Sha256(...), so presumably the Crypto class wraps calls like mbedtls_sha256(...).
4.5 Dispatcher
A dispatcher class helps route ECalls to the relevant code:
It holds references to the Crypto and Attestation instances.
Its methods correspond to the ECalls you define in the EDL. For example:
cpp
Copy code
int dispatcher::get_remote_report_with_pubkey(
    uint8_t** pem_key,
    size_t* key_size,
    uint8_t** remote_report,
    size_t* remote_report_size);
calls m_attestation->generate_report(...) and possibly calls m_crypto to produce/return the public key.
4.6 Makefile and Compilation
The notes show how to modify the enclave’s Makefile so that:

The EDL is compiled using oeedger8r ... --trusted.
The .cpp files for attestation.cpp, crypto.cpp, and dispatcher.cpp are included and compiled with the rest of the enclave code.
The final step is to sign the enclave with oesign.
The important thing is that attestation.cpp and crypto.cpp must be compiled as C++ ($(CXX)), because they contain C++ code.

5. Host-Side Code
5.1 ECalls from the Host
After the enclave is created (usually oe_create_<enclave_name>_enclave(...)), the host calls the ECalls:
get_report(...) returns pem_key (the enclave’s public key) plus the raw bytes of the SGX quote (report).
get_evidence_with_pub_key(...) returns a different style of buffer called “evidence,” plus the same or similar public key.
5.2 Parsing the Report / Quote
In SGX, the binary “report” includes the quote inside it once the Quoting Enclave signs it.

You can parse it with oe_parse_report(...) to get a structured oe_report_t containing fields like:

identity → includes MRENCLAVE, MRSIGNER, isv_prod_id, isv_svn.
report_data → the user-supplied 32-byte data (e.g., a SHA-256 hash).
quote → the full raw quote from the Quoting Enclave.
The notes show a QuoteGeneration utility that converts the parsed report to JSON. An example JSON might look like:

json
Copy code
{
  "MrEnclaveHex": "<enclave-hash>",
  "MrSignerHex": "<signer-hash>",
  "QuoteHex": "<long-hex-string>",
  ...
}
6. Generating Evidence vs. Generating a Report
The notes emphasize two possible approaches:

Generate the “report” inside the enclave

Then rely on Intel’s Quoting Enclave to sign it (i.e., produce the quote).
This is the “traditional” SGX approach.
Generate “evidence” (IETF RATS–style)

Still uses SGX under the hood.
Embeds custom claims in a more standardized format.
Potentially easier to verify using cross-platform tools.
Either way, in SGX the underlying final artifact is still a “quote” signed by Intel’s Quoting Enclave, but Open Enclave can wrap that quote in an IETF “evidence” structure with optional claims.

7. Putting It All Together (Runtime Flow)
AESM Service

Must be running for any remote attestation.
Enclave Startup

Host loads the enclave (via oe_create_*_enclave).
Key Generation

Inside the enclave (e.g., Crypto class) generates a public/private key pair.
Attestation Generation

Host calls get_report(...) or get_evidence_with_pub_key(...) via ECall.
Enclave uses oe_get_report(...) or oe_get_evidence(...):
Possibly embedding a hash of the public key or other data in the “report data” or custom claims.
Quoting Enclave signs it → final “quote” or “evidence” is returned to the host.
Verification

Host or a remote party calls oe_verify_report(...) or oe_verify_evidence(...) with Intel’s public keys or using Intel Attestation Service.
If valid, the remote party knows it’s a legitimate SGX enclave and possibly sees custom claims verifying the correct code or public key is loaded.
Next Steps

Typically, you’d transmit that quote/evidence over a secure channel to some external verification service. If verification passes, you can then trust the enclave with secrets or proceed to an attested TLS handshake.
8. Key Takeaways
SGX Remote Attestation revolves around generating a quote from the Quoting Enclave that a remote party can verify.
Open Enclave provides a simpler, more abstracted API for generating and verifying these quotes.
Reports vs. Evidence – The “report” is more SGX-specific, while “evidence” is a more general IETF RATS approach. Underneath, both contain the cryptographic “quote.”
Custom Claims let you embed arbitrary key–value data in the attestation, such as a public key hash, configuration data, or other identifying info.
Architecture – The user code is split into:
Enclave code (dispatcher, attestation, crypto) compiled with the SGX/Open Enclave libraries.
Host code that calls ECalls to the enclave.
A Makefile that ensures correct build and linking steps.
Verification – The crucial step is verifying the signature in the quote plus the enclave’s measurement. Once done, the remote side can trust that the code and data inside the enclave haven’t been tampered with.
<script src="{{ '/assets/js/dark-mode.js' | relative_url }}"></script>
