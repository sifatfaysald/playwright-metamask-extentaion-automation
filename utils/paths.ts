import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const storageDir = path.resolve(__dirname, '../../storage');
export const authStoragePath = path.join(storageDir, 'auth.json');
export const metamaskStoragePath = path.join(storageDir, 'metamask.json');
export const userDataDir = path.join(storageDir, 'user-data-dir');
