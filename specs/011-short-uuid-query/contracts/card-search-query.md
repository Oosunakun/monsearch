# Contract: Short UUID Card Search Query

## Accepted values

The aliases `ct`, `pd`, `fa`, `ra`, `il`, `eat`, `re`, and `are` accept comma-separated values. Each value must be exactly five ASCII hexadecimal characters. `0-9`, `a-f`, and `A-F` are accepted; whitespace around collection members may follow existing collection parsing rules.

## Canonical output

The canonical Builder output lowercases alphabetic characters, removes malformed members, removes duplicate canonical members, and uses the existing stable collection ordering. Example: `pd=22D7E,abcde` becomes `pd=22d7e,abcde` if both members are valid.

## Unknown but valid values

A valid five-character value is retained even when no current master-data ID ends with it. It remains a search condition and consequently matches no card for that member. Other valid members in the same Parameter continue to use the existing OR behavior.

## Invalid values and collisions

Values with another length, non-ASCII-hex characters, or empty members are omitted. The application does not detect, report, or resolve collisions among IDs referenced by one Parameter; uniqueness is a producer-side invariant.

## Compatibility

All aliases outside the eight Short UUID aliases retain their existing parsing, canonicalization, and search semantics. URL percent encoding remains the responsibility of Vue Router/framework serialization.
