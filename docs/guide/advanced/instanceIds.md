# Understanding Instance Ids

Source: https://nanook.xhub.io/docs/guide/advanced/instanceIds

The instance ID mechanism solves a common problem: you need the **same** generated data set to provide values for multiple fields.

Consider a `PersonGenerator` that creates a coherent person record (first name, last name, email). If you have three separate fields in your table — `firstName`, `lastName`, and `email` — you want all three to come from the same generated person, not three different random people.

```
gen:1:PersonGenerator:firstName
gen:1:PersonGenerator:lastName
gen:1:PersonGenerator:email
```

Here is what happens:

1. The first call (`firstName`) creates a new person instance and stores it under instance ID `1`. The `firstName` value is returned.
2. The second call (`lastName`) finds that instance ID `1` already exists for `PersonGenerator`. Instead of generating new data, it retrieves the existing instance and returns the `lastName`.
3. The third call (`email`) works the same way — it returns the `email` from the already-generated instance.

If you use a different instance ID (or no instance ID), a new independent data set is generated:

```
gen:1:PersonGenerator:firstName    <- Person A
gen:1:PersonGenerator:lastName     <- Person A (same instance)
gen:2:PersonGenerator:firstName    <- Person B (different instance)
gen::PersonGenerator:firstName     <- Person C (auto-generated UUID, always new)
```

Generator directives also carry an `order` property (default 1000); directives with a lower order run first, which lets one generator's output feed another.

Source: the section "Instance IDs" of [docs/guide/directives.md](https://github.com/xhubio/nanook-table/blob/master/docs/guide/directives.md) in the repository (Nanook 3.x).

---
Index of all docs: https://nanook.xhub.io/llms.txt
