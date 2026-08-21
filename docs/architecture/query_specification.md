# Query Specification

**Version:** 1.0.0  
**Status:** Approved  
**Scope:** Repository Internal Specification

## Purpose

This document defines the canonical URL Query specification shared by the Query Builder and Query Parser.

The purpose of this specification is to define the **public URL Query format** used within this repository. It specifies how search conditions are represented as URL query parameters, independent of implementation details.

This specification is referenced by the following components:

- Query Builder
- Query Parser
- Builder / Parser Contract

Implementation details, framework-specific behavior, and internal source code structures are intentionally out of scope.

---

# 1. Design Principles

## 1.1 Scope

This specification defines only the representation of search conditions within URL query parameters.

It specifies:

- Query parameter names
- Value representation
- Canonicalization rules
- Builder / Parser guarantees

It does **not** specify:

- Query Builder implementation
- Query Parser implementation
- TypeScript models
- Framework-specific behavior (Vue Router, Nuxt, etc.)
- Validation logic
- API implementation

---

## 1.2 Design Goals

### Principle 1. Canonical Representation

The same search conditions shall always produce the same canonical URL Query representation.

The Query Builder is responsible for generating canonical URLs.

The Query Parser should accept non-canonical input whenever practical. Rebuilding the parsed result through the Query Builder shall always produce the canonical representation.

---

### Principle 2. Compactness

URL Queries should be represented as compactly as possible while maintaining sufficient human readability.

Abbreviated parameter names and compact value representations are encouraged where appropriate.

Representations that significantly reduce readability or maintainability should be avoided.

---

### Principle 3. Human Readability

URL Queries should remain reasonably understandable by humans.

Users should be able to infer the general meaning of search conditions without requiring knowledge of the internal implementation.

Perfect natural-language readability is not required.

---

### Principle 4. Deterministic Behavior

The Query Builder shall produce deterministic output.

Equivalent search conditions shall always generate identical URL Query representations regardless of:

- input order
- object construction order
- duplicate values
- internal implementation details

---

### Principle 5. Graceful Parsing

The Query Parser should tolerate unknown parameters, unexpected ordering, and other non-canonical input whenever possible.

Unknown or unsupported parameters shall be ignored without affecting valid search conditions.

After parsing, rebuilding through the Query Builder shall normalize the URL into its canonical representation.

---

### Principle 6. Internal Specification

This specification defines an internal URL Query format for this repository.

It is not intended to be:

- a public API
- a REST API
- a compatibility specification

Version 1 does not guarantee compatibility with earlier draft revisions.

---

### Principle 7. Stable Parameter Identifier

Query parameter names defined by this specification are stable identifiers.

They are independent of:

- UI labels
- TypeScript property names
- internal implementation details

Changing parameter identifiers constitutes a change to this specification.

---

## 1.3 Non Goals

The following items are explicitly outside the scope of this specification:

- Search UI design
- SearchForm structure
- Query Object definition
- Builder implementation
- Parser implementation
- Framework behavior
- API validation
- Search engine implementation

---

## 1.4 Design Reference

This specification is designed independently for this repository.

When evaluating URL Query syntax or query language design, the search syntax provided by **Scryfall** may be used as an informative reference due to its maturity and proven usability.

However, this specification does **not** aim to be compatible with or replicate Scryfall.

Repository-specific requirements always take precedence over Scryfall's design.

# 2. Value Format

This section defines the canonical representation of values within URL Query parameters.

## 2.1 Basic Format

The following value formats are defined.

| Type | Format | Example |
|------|--------|---------|
| Primitive | `key=value` | `nm=dragon` |
| Collection | `key=v1,v2,v3` | `el=fire,water` |
| Comparison | `key=operator:value` | `lv=eq:5` |
| Pair Collection | `key=k1:v1,k2:v2` | `ss=fire:2,water:1` |
| Modifier | `keySuffix=value` | `lvf=include`, `ssm=and` |

---

## 2.2 Reserved Separators

The following separator characters are reserved by this specification.

| Character | Name | Purpose |
|-----------|------|---------|
| `=` | Parameter Separator | Separates parameter name and value |
| `,` | Collection Separator | Separates multiple values within a collection |
| `:` | Pair Separator | Separates related values within a single item |

Examples:

```text
el=fire,water

lv=eq:5

ss=fire:2,water:1
```

---

## 2.3 Modifier Parameters

Search modifiers are represented as independent query parameters.

Examples:

```text
lv=eq:5
lvf=include

ss=fire:2,water:1
ssm=and
```

Modifier parameters represent search behavior rather than search values.

---

## 2.4 Default Value Omission

Builder should omit modifier parameters when they contain the default value.

Examples:

```text
lv=eq:5
```

instead of

```text
lv=eq:5
lvf=all
```

The absence of a modifier parameter represents the default behavior.

---

## 2.5 Comparison Values

Comparison values shall be represented using the following format.

```text
key=<operator>:<value>
```

Examples:

```text
lv=eq:5

at=gte:3

lm=lte:8
```

Both `operator` and `value` must exist together.

If either element is missing, Builder shall omit the parameter.

Parser should treat incomplete comparison values as invalid and ignore the parameter.

---

## 2.6 Collection Ordering

Builder shall output collection values in canonical order.

Examples:

```text
el=fire,water
```

instead of

```text
el=water,fire
```

Likewise,

```text
ss=fire:1,water:2
```

instead of

```text
ss=water:2,fire:1
```

Parser shall accept collection values regardless of ordering.

Rebuilding through the Builder shall normalize the output into canonical order.

# 3. Query Parameter Mapping

This section defines the mapping between Query Object properties and URL Query parameters.

Each Query Object property is assigned a stable parameter identifier (Alias). These aliases are part of this specification and shall remain stable unless this specification itself is revised.

---

## 3.1 Mapping Rules

The following rules define how parameter aliases are assigned.

### Stable Identifier

Each Query Object property shall be assigned a unique and stable parameter alias.

Parameter aliases are independent of:

- UI labels
- TypeScript property names
- Database column names
- Internal implementation

Changing an alias constitutes a change to this specification.

---

### Alias Length

Aliases should generally consist of two or three lowercase alphabetic characters.

Examples:

```text
nm
lv
el
css
```

---

### Prefix Convention

Properties representing additional equipment effects shall use the prefix `a`.

Examples:

```text
at   -> Attack

aat  -> Additional Attack

ss   -> Ability Spell Slot

ass  -> Additional Ability Spell Slot
```

---

### Modifier Convention

Modifier parameters shall be represented as independent query parameters.

The following suffixes are reserved.

| Suffix | Meaning |
|--------|---------|
| `f` | Filter Modifier |
| `m` | Match Modifier |

Examples:

```text
lv
lvm

ss
ssm
```

Modifier parameters represent search behavior rather than search values.

---

### Collision Resolution

When multiple properties would naturally produce identical aliases, the alias may be extended to three characters.

Examples:

```text
eft
eat
eac
```

---

## 3.2 Parameter Mapping

Each Query Object property shall be mapped to exactly one query parameter alias.

The complete parameter mapping is defined in the Parameter Mapping Table.

The table defines:

- Query Object Property
- Logical Name
- Parameter Alias
- Value Format
- Type
- Default Omission Rule

This table is the normative definition of all supported query parameters.

---

## 3.3 Parameter Stability

Parameter aliases defined by this specification shall remain stable across revisions of the implementation.

Internal refactoring, UI changes, database schema changes, or TypeScript model changes shall not require parameter alias changes.

Aliases may only change through a revision of this specification.

---

## 3.4 Reserved Parameter Suffixes

The following suffixes are reserved by this specification.

| Suffix | Purpose |
|--------|---------|
| `f` | Filter Modifier |
| `m` | Logical Match Modifier |

Future extensions should reuse these suffixes whenever applicable to preserve consistency.

---

## 3.5 Parameter Mapping Table

The complete Parameter Mapping Table is maintained as part of this specification.

Each entry defines:

- Query Object Property
- Logical Name
- Parameter Alias
- Value Format
- Type Information
- Default Omission Rule
- Classification

The Parameter Mapping Table is the authoritative reference used by the Query Builder and Query Parser.

Default Omission Rule defines the conditions under which the Query Builder shall omit a query parameter.

- Empty: Omit when the value is empty.
- Empty Collection: Omit when the collection contains no items.
- Default Filter: Omit when the filter is the default value.
- Default Match: Omit when the logical match is the default value.
- Incomplete Comparison: Omit when either the comparison operator or comparison value is missing.

|Query Object Property|Parameter Alias|Value Format|Query Object Type|Default Omission Rule|
|----|----|----|----|----|
|name|nm|Primitive|Primitive|Empty|
|cardCategory|cc|Primitive|Primitive|Empty|
|elements|el|Collection|Collection|Empty Collection|
|cardTypes|ct|Collection|Collection|Empty Collection|
|keyword|kw|Primitive|Primitive|Empty|
|products|pd|Collection|Collection|Empty Collection|
|factions|fa|Collection|Collection|Empty Collection|
|blocks|bl|Collection|Collection|Empty Collection|
|level.filterType|lvm|Modifier|Modifier|Default Filter|
|level|lv|Comparison|Comparison|Incomplete Comparison|
|heroPoint.filterType|hem|Modifier|Modifier|Default Filter|
|heroPoint|he|Comparison|Comparison|Incomplete Comparison|
|attack|at|Comparison|Comparison|Incomplete Comparison|
|defense|df|Comparison|Comparison|Incomplete Comparison|
|moveTypes|mt|Collection|Collection|Empty Collection|
|races|ra|Collection|Collection|Empty Collection|
|abilityItemSlots.match|ism|Modifier|Modifier|Default Match|
|abilityItemSlots|is|Pair Collection|Pair Collection|Empty Collection|
|abilitySpellSlots.match|ssm|Modifier|Modifier|Default Match|
|abilitySpellSlots|ss|Pair Collection|Pair Collection|Empty Collection|
|initiative|it|Comparison|Comparison|Incomplete Comparison|
|charge.filterType|chm|Modifier|Modifier|Default Filter|
|charge|ch|Comparison|Comparison|Incomplete Comparison|
|defender.filterType|dem|Modifier|Modifier|Default Filter|
|defender|de|Comparison|Comparison|Incomplete Comparison|
|resistances|re|Collection|Collection|Empty Collection|
|additionalAttack|aat|Comparison|Comparison|Incomplete Comparison|
|additionalDefense|adf|Comparison|Comparison|Incomplete Comparison|
|additionalAbilityItemSlots.match|aism|Modifier|Modifier|Default Match|
|additionalAbilityItemSlots|ais|Pair Collection|Pair Collection|Empty Collection|
|additionalAbilitySpellSlots.match|assm|Modifier|Modifier|Default Match|
|additionalAbilitySpellSlots|ass|Pair Collection|Pair Collection|Empty Collection|
|additionalInitiative|ait|Comparison|Comparison|Incomplete Comparison|
|additionalCharge.filterType|achm|Modifier|Modifier|Default Filter|
|additionalCharge|ach|Comparison|Comparison|Incomplete Comparison|
|additionalDefender.filterType|adem|Modifier|Modifier|Default Filter|
|additionalDefender|ade|Comparison|Comparison|Incomplete Comparison|
|additionalResistances|are|Collection|Collection|Empty Collection|
|limit|lm|Comparison|Comparison|Incomplete Comparison|
|landCategory|lc|Primitive|Primitive|Empty|
|costItemSlots.match|cism|Modifier|Modifier|Default Match|
|costItemSlots|cis|Pair Collection|Pair Collection|Empty Collection|
|costSpellSlots.match|cssm|Modifier|Modifier|Default Match|
|costSpellSlots|css|Pair Collection|Pair Collection|Empty Collection|
|costOtherEntities.match|coem|Modifier|Modifier|Default Match|
|costOtherEntities|coe|Pair Collection|Pair Collection|Empty Collection|
|effectTypes|eft|Collection|Collection|Empty Collection|
|effectActivationTypes|eat|Collection|Collection|Empty Collection|
|effectActivationCategories|eac|Collection|Collection|Empty Collection|
|effectText|etx|Primitive|Primitive|Empty|
|rarities|rt|Collection|Collection|Empty Collection|
|illustrators|il|Collection|Collection|Empty Collection|
|referenceLabel|rl|Primitive|Primitive|Empty|
|archetypeText|att|Primitive|Primitive|Empty|

# 4. Canonical Rule

This section defines the canonical representation of URL Query parameters.

The Query Builder is responsible for producing canonical URLs.

The Query Parser should accept non-canonical input whenever practical and normalize it through the Query Builder.

---

## 4.1 Parameter Ordering

The Query Builder shall output query parameters in the order defined by the Parameter Mapping Table.

The Query Parser shall accept parameters regardless of ordering.

---

## 4.2 Collection Ordering

Collection values shall be output in canonical order.

Example:

```text
el=fire,water
```

instead of

```text
el=water,fire
```

The Query Parser shall accept collection values regardless of ordering.

---

## 4.3 Pair Collection Ordering

Pair Collection values shall be output in canonical order.

Example:

```text
ss=fire:1,water:2
```

instead of

```text
ss=water:2,fire:1
```

The Query Parser shall accept Pair Collection values regardless of ordering.

---

## 4.4 Duplicate Parameter Handling

The Query Parser shall resolve duplicate parameters according to the Query Value Type.

| Query Value Type | Rule |
|------------------|------|
| Primitive | Last Value Wins |
| Modifier | Last Value Wins |
| Comparison | Last Value Wins |
| Collection | Merge All Values |
| Pair Collection | Merge All Values |

For Collection values, duplicate items shall be removed during normalization.

Example:

```text
el=fire&el=water,fire
```

shall be normalized as

```text
el=fire,water
```

For Pair Collection values, duplicate keys shall be resolved using **Last Value Wins**.

Example:

```text
ss=fire:1&ss=fire:2
```

shall be interpreted as

```text
ss=fire:2
```

The Query Builder shall never generate duplicate parameters.

---

## 4.5 Default Parameter Omission

The Query Builder shall omit parameters according to the Default Omission Rule defined by this specification.

The Query Parser shall restore omitted parameters using their corresponding default values.

---

## 4.6 Canonical Rebuild

The Query Builder shall always generate canonical URL Query parameters.

The Query Parser shall accept non-canonical input whenever practical.

Rebuilding a parsed Query Object through the Query Builder shall always produce the canonical representation.

```
Non-Canonical URL
        │
        ▼
   Query Parser
        │
        ▼
   Query Object
        │
        ▼
  Query Builder
        │
        ▼
 Canonical URL
```

---

## 4.7 Invalid Value Handling

The Query Builder shall never output invalid parameter values.

The Query Parser shall ignore parameters whose values do not conform to this specification and continue parsing the remaining valid parameters.

Invalid parameters shall not prevent other valid search conditions from being restored.

# 5. Encoding

This section defines the encoding rules for URL Query parameters.

This specification defines the logical representation of query parameters only.

Framework-specific URL encoding is outside the scope of this specification.

---

## 5.1 Logical Query Parameter

The Query Builder converts a Query Object into a **Logical Query Parameter** defined by this specification.

A Logical Query Parameter is the canonical representation of search conditions before framework-specific URL encoding is applied.

Example:

```text
nm=Blue Dragon
el=fire,water
lv=eq:5
```

The conversion from a Logical Query Parameter to an actual URL is the responsibility of the underlying framework.

---

## 5.2 URL Encoding

Framework-specific URL encoding shall be delegated to the framework implementation.

This specification does not define how reserved characters are percent-encoded.

Implementations should rely on standard URL encoding mechanisms provided by the runtime or framework.

Examples include:

- URLSearchParams
- Vue Router
- Nuxt Router

---

## 5.3 Character Encoding

URL Query parameters shall be encoded using UTF-8.

---

## 5.4 Reserved Characters

The following characters are reserved by this specification.

| Character | Purpose |
|-----------|---------|
| `=` | Parameter Separator |
| `,` | Collection Separator |
| `:` | Pair Separator |

These characters are part of the logical query syntax and shall not be interpreted as literal values.

If a query value contains reserved characters, they shall be encoded by the framework during URL generation.

---

## 5.5 Scope

This specification defines:

- Logical Query Parameter structure
- Reserved query syntax
- Canonical query representation

This specification does not define:

- Percent encoding
- Browser behavior
- Framework implementation
- URL serialization

# 6. Version

This section defines the versioning policy for this specification.

The version of this specification follows the format:

```text
Major.Minor.Revision
```

Example:

```text
1.0.0
```

---

## 6.1 Versioning Policy

The version number shall be updated according to the following rules.

| Version | Description |
|----------|-------------|
| Major | Changes that break backward compatibility. |
| Minor | Backward-compatible additions or extensions to the specification. |
| Revision | Editorial improvements that do not change the meaning of the specification, such as typo corrections, wording improvements, examples, or documentation updates. |

---

## 6.2 Backward Compatibility

Backward compatibility shall be maintained within the same Major version.

Changes introduced in Minor or Revision releases shall not invalidate URLs that conform to previous Minor or Revision releases of the same Major version.

Major version changes may introduce incompatible changes.

---

## 6.3 Version Representation

Version information shall not be represented as a URL Query parameter in Version 1 of this specification.

Example:

```text
/cards?nm=dragon
```

instead of

```text
/cards?v=1&nm=dragon
```

Future revisions of this specification may introduce explicit version identifiers if backward compatibility across Major versions becomes necessary.

---

## 6.4 Source of Truth

This document (`query_specification.md`) is the authoritative definition of the Query Specification.

All Query Builders, Query Parsers, Contracts, and related implementations shall conform to the version defined by this document.

If discrepancies exist between implementations and this specification, this specification shall take precedence.

# 7. Builder / Parser Guarantee

This section defines the responsibilities and guarantees provided by the Query Builder and Query Parser.

Both components shall conform to this specification.

Together, they guarantee a deterministic and reversible transformation between a Query Object and URL Query parameters.

---

## 7.1 Query Builder Guarantee

The Query Builder shall guarantee the following.

- Generate URL Query parameters that conform to this specification.
- Generate the canonical representation defined by the Canonical Rule.
- Generate parameters according to the Parameter Mapping Table.
- Generate values according to the Value Format.
- Omit parameters according to the Default Omission Rule.
- Never generate duplicate parameters.
- Never generate invalid parameter values.

The Query Builder shall not perform framework-specific URL encoding.

---

## 7.2 Query Parser Guarantee

The Query Parser shall guarantee the following.

- Parse URL Query parameters according to this specification.
- Accept both canonical and non-canonical query representations whenever practical.
- Restore omitted parameters using their default values.
- Resolve duplicate parameters according to the Canonical Rule.
- Ignore unknown parameters.
- Ignore invalid parameter values while continuing to parse the remaining valid parameters.

The Query Parser shall never fail solely because non-canonical or unknown parameters are present.

---

## 7.3 Round-trip Guarantee

The Query Builder and Query Parser shall preserve the logical meaning of a Query Object.

The following transformation shall be reversible.

```text
Query Object
      │
      ▼
Query Builder
      │
      ▼
URL Query
      │
      ▼
Query Parser
      │
      ▼
Query Object
```

Likewise, rebuilding a parsed URL shall always produce the canonical representation.

```text
Non-Canonical URL
        │
        ▼
   Query Parser
        │
        ▼
   Query Object
        │
        ▼
  Query Builder
        │
        ▼
 Canonical URL
```

This guarantee ensures that different URL representations describing the same search conditions are normalized into a single canonical representation.

---

## 7.4 Out of Scope

The Query Builder and Query Parser do not guarantee the following.

- Business rule validation
- Search condition validation
- API request validation
- Search result correctness
- Database consistency
- Framework-specific behavior
- Browser-specific behavior

These responsibilities belong to higher-level application components.
