declare const require: (path: string) => number;

declare module "*.jpeg" {
  const value: number;
  export default value;
}

declare module "*.jpg" {
  const value: number;
  export default value;
}

declare module "*.png" {
  const value: number;
  export default value;
}

declare module "*.tflite" {
  const value: number;
  export default value;
}

declare module "*.txt" {
  const value: number;
  export default value;
}
