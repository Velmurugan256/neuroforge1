import { createFile } from "../../common/api";



export const useCreateFile = (refreshTree) => {
  const create = async (folderPath, extension) => {
    const name = prompt(`Enter ${extension} file name (no extension):`);
    if (!name) return;

    const filePath = `${folderPath}/${name}.${extension}`;
    const defaultContent = extension === "json" ? "{}" : "";

    try {
      await createFile(filePath, defaultContent);
      refreshTree?.(); // optional reload
    } catch (err) {
      alert(err.message);
    }
  };

  return { create };
};
