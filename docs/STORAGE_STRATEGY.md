# ExamInA - Storage Strategy

This document defines how ExamInA will handle uploaded files during development and production.

## Decision

For local development and debugging, ExamInA will use a filesystem-backed storage provider.

For production, ExamInA will use AWS S3 behind the same `StorageProvider` interface.

The business logic must not depend directly on local filesystem APIs or AWS SDK APIs. It should depend only on the storage provider contract.

## Providers

The backend will keep storage implementations inside:

```txt
apps/api/src/shared/providers/storage/
```

Expected implementations:

```txt
storage-provider.interface.ts
local-storage.provider.ts
s3-storage.provider.ts
```

The provider will be selected by environment configuration:

```env
STORAGE_PROVIDER="local"
LOCAL_STORAGE_ROOT="./storage/uploads"
LOCAL_STORAGE_PUBLIC_BASE_URL="http://localhost:3000/api/v1/storage/local"

AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION=""
S3_BUCKET=""
```

## Local Provider

The local provider will use Node.js filesystem primitives:

```txt
node:fs
node:path
node:crypto
```

Uploaded files should be stored under:

```txt
apps/api/storage/uploads/
```

That folder must be ignored by Git. It is local runtime data, not source code.

The API can expose local files through a controlled local route during development, while still storing file metadata in PostgreSQL through `FileAsset`.

## S3 Provider

The S3 provider will use the AWS SDK packages already installed in the API:

```txt
@aws-sdk/client-s3
@aws-sdk/s3-request-presigner
```

S3 remains the production target, especially for user uploads, handwritten answer images, profile assets and OCR/LLM processing sources.

## Metadata

Files are not stored inside PostgreSQL.

PostgreSQL stores metadata and references through `FileAsset` and related tables:

```txt
FileAsset
AttemptAsset
ExamSessionAsset
LlmReviewAsset
```

The physical bytes live either in local filesystem during development or S3 in production.

## Implementation Order

1. Implement `LocalStorageProvider`.
2. Wire it into the files module.
3. Store file metadata in `FileAsset`.
4. Test uploads from Postman and web.
5. Implement `S3StorageProvider` later without changing business services.
