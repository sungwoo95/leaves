export type Directory = {
  _id: string;
  name: string;
  type: "folder" | "file";
  children?: Directory[];
};
