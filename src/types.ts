export interface Presentation {
  category?: string;
  purpose?: string;
  recommended?: boolean;
  language?: string;
  languages?: string[];
  iconUrl?: string;
  rawIconUrl?: string;
}

export interface ModuleItem {
  id: string;
  familyId?: string;
  identity?: string;
  identityNumber?: number;
  contentType: 'video' | 'image' | 'text' | 'music';
  version: string;
  minAppVersion: string;
  packagePath?: string;
  packageUrl?: string;
  sha256: string;
  publishedAtMs: number;
  changelog: string[];
  presentation: Presentation;
  localFile: string;
  sizeBytes: number;
  existsOnDisk: boolean;
}

export interface RepositoryData {
  repositoryId: string;
  name: string;
  schemaVersion: number;
  bundle: {
    version: number;
    minAppVersion: string;
    packageUrl: string;
    packagePath: string;
    sha256: string;
    signature: string;
  };
  modulesCount: number;
  categories: Record<string, number>;
  contentTypes: Record<string, number>;
  defaultModules: Record<string, string>;
  publishedAtMs: number;
  hasSignature: boolean;
  signature: string;
}

export interface RunModuleRequest {
  moduleId: string;
  action: 'discoveryHome' | 'discoveryFeed' | 'searchResults' | 'extractDetails' | 'extractEpisodes' | 'extractChapters' | 'extractStreamUrl' | 'extractImages';
  params?: {
    query?: string;
    page?: number;
    feedId?: string;
    id?: string;
    episodeRef?: string;
    subOrDub?: 'sub' | 'dub';
    chapterId?: string;
  };
}

export interface RunModuleResponse {
  ok: boolean;
  action?: string;
  moduleId?: string;
  sourceLabel?: string;
  durationMs: number;
  payloadSizeBytes?: number;
  exceedsBudget?: boolean;
  result?: any;
  error?: string;
  stack?: string;
}

export interface TestResultItem {
  name: string;
  ok: boolean;
  durationMs?: number;
}

export interface TestSuiteResponse {
  suite: string;
  success: boolean;
  total: number;
  passed: number;
  failed: number;
  tests: TestResultItem[];
  rawOutput: string;
}

export interface ChecksumResultItem {
  file: string;
  expectedHash: string;
  actualHash: string | null;
  exists: boolean;
  valid: boolean;
}

export interface ChecksumsResponse {
  allValid: boolean;
  totalChecked: number;
  results: ChecksumResultItem[];
}
