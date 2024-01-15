export interface DbSchemaInfo {
  name: string;
}

export interface ColumnInfo {
  name: string;
  isPrimary: boolean;
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
}

export interface ForeignKeyInfo {
  constraintName: string
  foreignKeyColumnName : string;
  foreignKeyTableName : string;
  primaryKeyColumnName : string;
  primaryKeyTableName : string;
}
