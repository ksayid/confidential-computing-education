Several software-based storage system protection techniques are integrated into mainstream
operating systems. Encryption-enabled file systems (e.g., Linux
ecryptfs [37], and Windows EFS [1]) allow directory-level
encryption. Block-layer encryption techniques such as dmcrypt [25] directly encrypt the entire block device. dm-crypt
also offers integrity checking of read-only filesystems where
the entire block device is verified at once. This approach is
particularly time-consuming and thus is typically used only
during device startup [6], [44]. dm-verify [6] uses a software
maintained Merkle tree structure to compute and validate
hashes of read-only data blocks against pre-computed hashes.
In contrast, dm-integrity keeps individual hashes for each data
block during runtime, which allows verification for read/write
system. However, it cannot detect physical attacks such as
reordering the blocks within the same device due to the lack
of a secure root of trust in the system. Finally, software-based
schemes can have substantial overhead as the en/decryption
is done in software via executing many kernel sub-routines
across software layers [15], [63].