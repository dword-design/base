type UnionToIntersection<T> = (
  T extends unknown ? (value: T) => void : never
) extends (value: infer I) => void
  ? I
  : never;

type LastOf<T> = UnionToIntersection<
  T extends unknown ? (value: T) => void : never
> extends (value: infer I) => void
  ? I
  : never;

type Push<T extends unknown[], V> = [...T, V];

type UnionToTuple<T, L = LastOf<T>> = [T] extends [never]
  ? []
  : Push<UnionToTuple<Exclude<T, L>>, L>;

export type TypedKeys<T extends object> = UnionToTuple<keyof T>;

export default <T extends object>(object: T) =>
  Object.keys(object) as TypedKeys<T>;
