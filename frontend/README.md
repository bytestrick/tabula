# Tabula frontend

## Development

Some useful commands

- `npx madge --circular --extensions ts ./` to find circular dependencies. It might report false positives, for example `ToastService` is injected in `ToastComponent` and `ToastService` imports the `ToastOptions` interface from `toast.component.ts`. This is reported as a circular dependency.
- `ng test --no-watch --code-coverage` for [test coverage reports](https://angular.dev/guide/testing/code-coverage).
