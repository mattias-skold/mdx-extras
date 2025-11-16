# Typeahead plugin implementation

The typeahead plugin implementation should support typeahead for multiple types of data. Each data should use its own text directive (the name should be set, per data type), its own data source resolution, and its own rendering of autocompletion items. Each data type should have its own activation character - for example, `@` may activate mentions, while `#` can activate issues, etc.

There's already a reference implementation of a mention plugin in packages/typeahead-plugin/src/basis that's hard-coded to users, and a hard-coded mention lexical node. Use it as a reference, but don't import any of its code. it will be deleted after this task is complete.

Concerns

- I'm not sure I'm not missing something that needs to be configured per data source. Check this.
- Styling needs consideration, but it's not the main focus of this task.
