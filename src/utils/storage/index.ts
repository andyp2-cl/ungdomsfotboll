
// Re-export everything from the individual files
export * from './tabs';
export * from './playerStorage';
export * from './activity';

// Delete the old activityStorage.ts file since it's no longer needed
<lov-delete file_path="src/utils/storage/activityStorage.ts" />
