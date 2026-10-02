# Overview equivalence class table

Source: https://nanook.xhub.io/docs/modules/overview

Nanook is built from five modules, each documented on its own page in this section.

- [Model](https://nanook.xhub.io/docs/modules/model) — the table and test case interfaces: which fields a table has, which equivalence classes, which test cases, and what a test case needs in order to be generated.
- [File processor](https://nanook.xhub.io/docs/modules/fileProcessor) — importers read a workbook, parsers turn each sheet into a table model, keyed by the marker in the first cell.
- [Data generator](https://nanook.xhub.io/docs/modules/dataGenerator) — the generator interface, the base class to extend, the registry from which the processor resolves generators, and the built-in Faker generator.
- [Writer](https://nanook.xhub.io/docs/modules/writer) — receives every generated test case and writes it wherever it is needed: JSON files by default, anything else through a custom writer.
- [Logger](https://nanook.xhub.io/docs/modules/logger) — the logging facade the other modules report through, with an in-memory implementation.

These pages describe the 1.x modules; the 3.x layout is the same (model, file processor, data generator, processor with writers, logger) and is documented in the repository under [docs/api](https://github.com/xhubio/nanook-table/tree/master/docs/api).

---
Index of all docs: https://nanook.xhub.io/llms.txt
