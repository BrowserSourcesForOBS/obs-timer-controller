declare module "*.png";
declare module "*.svg";
declare module "*.scss";
declare module "*.md" {
    const text: string;
    export default text;
}
