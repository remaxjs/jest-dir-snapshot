declare module 'sander';
declare module 'fs-readdir-recursive';

declare namespace jest {
  interface Matchers<R, T> {
    toMatchDirSnapshot: (options?: any) => R;
  }
}
