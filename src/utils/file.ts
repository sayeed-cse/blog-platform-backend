import fs from 'fs';
import path from 'path';

export const deleteLocalFileIfExists = (filePath?: string | null) => {
  if (!filePath || !filePath.startsWith('/uploads/')) return;

  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};
