# jest-dir-snapshot

Jest matcher for directory snapshot.

## Usage

### Installation

```bash
$ npm i --save-dev jest-dir-snapshot
```

### Invocation

1. Extend Jest's expect

```js
const { toMatchDirSnapshot } = require('jest-dir-snapshot');

expect.extend({ toMatchDirSnapshot });
```

2. Use `toMatchDirSnapshot()` in your tests!

```js
expect({
  'foo.js': 'foo',
}).toMatchDirSnapshot();
```

## API

- `toMatchDirSnapshot` takes an optional options object with the following properties:
  - `snapshotsDir`: A custom absolute path of a directory to keep this snapshot in.
  - `snapshotIdentifier`: A custom name to give this snapshot. If not provided one is computed automatically.

## License

[MIT](LICENSE)
