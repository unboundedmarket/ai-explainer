import 'react-d3-tree';

declare module 'react-d3-tree' {
  interface TreeNodeDatum {
    __rd3t?: any;
  }
}
