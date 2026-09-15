/* Every documentation page exports its title and description next to the content. */
declare module '*.mdx' {
  export const metadata: { title: string; description: string };
}
