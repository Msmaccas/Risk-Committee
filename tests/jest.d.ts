// Minimal Jest type declarations to satisfy TypeScript without installing
// @types/jest.  The actual implementations are provided by Jest at runtime.
declare function describe(description: string, suite: () => void): void;
declare function test(description: string, testFn: (done?: () => void) => void | Promise<void>): void;
declare function expect(actual: any): any;
