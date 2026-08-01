export default <T extends object>(object: T) =>
  Object.keys(object) as (keyof T)[];
