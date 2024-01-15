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
  constraintNameField: string
  foreignKeyColumnNameField : string;
  foreignKeyTableNameField : string;
  frimaryKeyColumnNameField : string;
  frimaryKeyTableNameField : string;
}
