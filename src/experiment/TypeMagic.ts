
export type TypeReplacement = {
  path: readonly any[];
  value: any;
};

type ReplaceDeep<T, Path extends readonly any[], V> =
  Path extends [infer K, ...infer Rest]
  ? K extends number
  ? T extends Array<infer U>
  ? Array<ReplaceDeep<U, Rest, V>>
  : T
  : K extends keyof T
  ? Omit<T, K> & { [P in K]: ReplaceDeep<T[K], Rest, V> }
  : T
  : V;


export type ApplyTypeReplacements<T, R extends readonly TypeReplacement[]> =
  R extends readonly [infer First, ...infer Rest]
  ? First extends { path: infer P extends readonly any[]; value: infer V }
  ? ApplyTypeReplacements<ReplaceDeep<T, P, V>, Rest extends readonly TypeReplacement[] ? Rest : []>
  : T
  : T;