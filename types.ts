import * as Field from "./field-types.ts";

import { Timezone, UserLocale } from "./constants.ts";

export interface AirtableOptions {
  apiKey?: string;
  endpointUrl?: string;
  baseId?: string;
  tableName?: string;
  useEnv?: boolean;
}

export interface AirtableRequestOptions extends RequestInit {
  url: string;
  jsonBody?: any;
}

export interface FieldSet<T extends string = string> {
  [key: string]: FieldSetValue<T>;
}

export { Field };

export type FieldSetValue<T extends string = string> =
  | undefined
  | string
  | string[]
  | number
  | boolean
  | Field.RecordLink
  | Field.SingleLineText
  | Field.LongText
  | Field.Checkbox
  | Field.MultipleSelect<T>
  | Field.SingleSelect<T>
  | Field.Collaborator
  | Field.Collaborators
  | Field.Attachment[]
  | Field.DateType
  | Field.PhoneNumber
  | Field.Email
  | Field.URL
  | Field.Number
  | Field.Currency
  | Field.Percent
  | Field.Duration
  | Field.Rating;

export interface SelectOptions<T extends FieldSet> {
  fields?: (keyof T)[];
  filterByFormula?: string;
  maxRecords?: number;
  pageSize?: number;
  sort?: {
    field: string;
    direction?: "asc" | "desc";
  }[];
  view?: string;
  cellFormat?: "json" | "string";
  timeZone?: Timezone;
  userLocale?: UserLocale;
}

export interface SelectResult<T extends FieldSet> extends TableRecords<T> {
  offset: string;
}

export interface TableRecord<T extends FieldSet> {
  id: string;
  fields: T;
  createdTime?: string;
}

export interface TableRecords<T extends FieldSet> {
  records: TableRecord<T>[];
}

export interface DeletedRecord {
  id: string;
  deleted: boolean;
}

export interface DeletedRecords {
  records: DeletedRecord[];
}

export interface RecordOptions {
  typecast?: boolean;
}
