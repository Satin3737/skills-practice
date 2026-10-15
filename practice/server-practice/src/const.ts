import path from 'path';

export const SrcDir = import.meta.dirname;
export const AssetsDir = path.join(SrcDir, 'assets');
export const StorageDir = path.join(SrcDir, '../storage');

export const Port = 8080;
export const BaseUrl = `http://localhost:${Port}`;

export const ShutdownTimeout = 10_000;
export const RequestTimeout = 30_000;
export const BodyLimit = 1024 * 1024;
