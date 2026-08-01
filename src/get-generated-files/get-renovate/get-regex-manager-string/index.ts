export default (name: string, content: string) =>
  `(^|[^\\w])${name}\`${content}\``;
