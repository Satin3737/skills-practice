import path from 'path';

export const SrcDir = import.meta.dirname;
export const PublicDir = path.join(SrcDir, 'public');
export const AssetsDir = path.join(PublicDir, 'assets');
export const DocsDir = path.join(PublicDir, 'docs');
export const StorageDir = path.join(SrcDir, '../storage');

export const Port = 8080;
export const BaseUrl = `http://localhost:${Port}`;

export const ShutdownTimeout = 10_000;
export const RequestTimeout = 30_000;
export const BodyLimit = 1024 * 1024;
