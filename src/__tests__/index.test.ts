import * as path from 'path';
import * as fs from 'fs';
import { toMatchDirSnapshot } from '..';

expect.extend({ toMatchDirSnapshot });

describe('jest-dir-snapshot', () => {
  const dir = {
    'foo.js': 'foo',
    'foo/index.js': 'index',
  };

  it('match snapshot', () => {
    expect(dir).toMatchDirSnapshot();
  });

  it('custom snapshots dir', () => {
    expect(dir).toMatchDirSnapshot({
      snapshotsDir: path.resolve(__dirname, '__my_snapshots__'),
    });
  });

  it('custom snapshot identifier', () => {
    expect(dir).toMatchDirSnapshot({
      snapshotIdentifier: 'my-identifier',
    });
  });


  it('not match snapshot', () => {
    expect({ ...dir, 'bar.js': 'bar' }).not.toMatchDirSnapshot();
  });
});
