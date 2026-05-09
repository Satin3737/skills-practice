import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

export const SrcDir = path.dirname(__filename);
export const AssetsDir = path.join(SrcDir, 'assets');
export const StorageDir = path.join(SrcDir, '../storage');

export const Port = 8080;
export const BaseUrl = `http://localhost:${Port}`;
