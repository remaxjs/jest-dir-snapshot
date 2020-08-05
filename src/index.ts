import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import * as sander from 'sander';
import readdir from 'fs-readdir-recursive';
import diff from 'jest-diff';
import { sortBy, kebabCase } from 'lodash';
import * as eol from 'eol';

type Received = Record<string, string>;

export interface Options {
  snapshotsDir: string;
  snapshotIdentifier: string;
}

export function slash(path: string) {
  return /^\\\\\?\\/.test(path) ? path : path.replace(/\\/g, `/`);
}

function buildText(files: Received) {
  return sortBy(
    Object.keys(files).map(fileName => ({
      content: files[fileName],
      fileName: slash(fileName),
    })),
    ['fileName']
  )
    .reduce((acc: string[], f) => {
      acc.push(
        `file: ${f.fileName}`,
        Array(80).join('-'),
        ...eol.split(f.content).map(l => `${f.fileName}: ${l}`),
        Array(80).join('-')
      );
      return acc;
    }, [])
    .join(eol.auto.toString());
}

export function toMatchDirSnapshot(
  this: jest.MatcherContext,
  received: Received,
  customOptions: Partial<Options> = {}
) {
  const { isNot, testPath, currentTestName } = this;
  const snapshotState = this.snapshotState;
  const actual = buildText(received);

  // Options for jest-diff
  const diffOptions = Object.assign({
    expand: false,
    contextLines: 5,
    aAnnotation: 'Snapshot',
  });

  const options = Object.assign(
    {},
    {
      snapshotsDir: '__dir_snapshots__',
    },
    customOptions
  );

  const snapshotsDir = customOptions.snapshotsDir || path.join(path.dirname(testPath), options.snapshotsDir);
  const snapshotIdentifier = options.snapshotIdentifier || kebabCase(`${path.basename(testPath)}-${currentTestName}`);
  const output = path.join(snapshotsDir, snapshotIdentifier);

  if (fs.existsSync(output)) {
    const expected = buildText(
      readdir(output).reduce((acc: any, fileName: string) => {
        acc[fileName] = eol.lf(sander.readFileSync(path.join(output, fileName)).toString());
        return acc;
      }, {})
    );

    if (isNot) {
      // The matcher is being used with `.not`

      if (!this.equals(actual, expected)) {
        // The value of `pass` is reversed when used with `.not`
        return { pass: false, message: () => '' };
      } else {
        snapshotState.unmatched++;

        return {
          pass: true,
          message: () => `Expected received content ${chalk.red('to not match')} the output ${chalk.blue(output)}.`,
        };
      }
    } else {
      if (this.equals(actual, expected)) {
        return { pass: true, message: () => '' };
      } else {
        if (snapshotState._updateSnapshot === 'all') {
          sander.rimrafSync(output);
          Object.keys(received).forEach(fileName => {
            sander.writeFileSync(path.join(output, fileName), received[fileName]);
          });

          snapshotState.updated++;

          return { pass: true, message: () => '' };
        } else {
          snapshotState.unmatched++;

          return {
            pass: false,
            message: () =>
              `Received content ${chalk.red("doesn't match")} the output ${output}.\n\n${diff(
                expected,
                actual,
                diffOptions
              )}`,
          };
        }
      }
    }
  } else {
    if (!isNot && (snapshotState._updateSnapshot === 'new' || snapshotState._updateSnapshot === 'all')) {
      Object.keys(received).forEach(fileName => {
        sander.writeFileSync(path.join(output, fileName), received[fileName]);
      });
      snapshotState.added++;

      return { pass: true, message: () => '' };
    } else {
      snapshotState.unmatched++;

      return {
        pass: true,
        message: () => `The output file ${chalk.blue(output)} ${chalk.bold.red("doesn't exist")}.`,
      };
    }
  }
}
