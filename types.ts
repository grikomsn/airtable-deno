export namespace Field {
  export type SingleLineText = string;
  export type LongText = string;
  export type Checkbox = boolean;
  export type MultipleSelect<T extends string> = T[];
  export type SingleSelect<T extends string> = T[];
  export interface Collaborator {
    id: string;
    email: string;
    name: string;
  }
  export type Collaborators = Collaborator[];
  export interface Attachment {
    id: string;
    url: string;
    filename: string;
    size: number;
    type: string;
    thumbnails?: {
      small: Thumbnail;
      large: Thumbnail;
      full: Thumbnail;
    };
  }
  export type DateType = Date | string;
  export type PhoneNumber = string;
  export type Email = string;
  export type URL = string;
  export type Number = number;
  export type Currency = number;
  export type Percent = number;
  export type Duration = number;
  export type Rating = number;
}

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface AirtableOptions {
  apiKey?: string;
  endpointUrl?: string;
  baseId?: string;
  tableName?: string;
  useEnv?: boolean;
}

export type AirtableRequestOptions = RequestInit & {
  url: string;
  jsonBody?: any;
};

export interface FieldSet<T extends string> {
  [key: string]:
    | undefined
    | string
    | number
    | boolean
    | Field.SingleLineText
    | Field.LongText
    | Field.Checkbox
    | Field.MultipleSelect<T>
    | Field.SingleSelect<T>
    | Field.Collaborator
    | Field.Collaborators
    | Field.Attachment
    | Field.DateType
    | Field.PhoneNumber
    | Field.Email
    | Field.URL
    | Field.Number
    | Field.Currency
    | Field.Percent
    | Field.Duration
    | Field.Rating;
}

export interface SelectOptions<T extends string | number | symbol> {
  fields?: T[];
  filterByFormula?: string;
  maxRecords?: number;
  pageSize?: number;
  sort?: {
    field: string;
    direction?: "asc" | "desc";
  }[];
  view?: string;
  cellFormat?: "json" | "string";
  timeZone?: string;
  userLocale?: string;
}

export type SelectResult<T extends FieldSet<string>> = TableRecords<T> & {
  offset: string;
};

export interface TableRecord<T extends FieldSet<string>> {
  id: string;
  fields: T;
  createdTime?: string;
}

export type TableRecords<T extends FieldSet<string>> = {
  records: TableRecord<T>[];
};

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
