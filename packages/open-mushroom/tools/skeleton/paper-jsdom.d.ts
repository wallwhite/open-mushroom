/* paper-jsdom re-exports the paper package (same version) bootstrapped for headless Node. */
declare module 'paper-jsdom' {
  import paper from 'paper';

  export = paper;
}
