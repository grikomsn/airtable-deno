import { stringify } from "./deps.ts";
import {
  AirtableError,
  AirtableOptions,
  AirtableRequestOptions,
  FieldSet,
  RecordOptions,
  SelectOptions,
  SelectResult,
  TableRecord,
  TableRecords,
} from "./mod.ts";
import { DeletedRecord, DeletedRecords } from "./types.ts";
import { hasAnyKey } from "./utils.ts";

/**
 * Unofficial Airtable API client for Deno
 *
 * @author Griko Nibras <hello@griko.id>
 * @export
 * @class Airtable
 */
export class Airtable {
  #options: AirtableOptions;

  /**
   * Creates an instance of Airtable
   *
   * @param {AirtableOptions} options Airtable client configuration
   * @memberof Airtable
   */
  constructor(options: AirtableOptions = {}) {
    this.#options = {
      ...(options.useEnv
        ? {
            apiKey: Deno.env.get("AIRTABLE_API_KEY"),
            endpointUrl: Deno.env.get("AIRTABLE_ENDPOINT_URL"),
            baseId: Deno.env.get("AIRTABLE_BASE_ID"),
            tableName: Deno.env.get("AIRTABLE_TABLE_NAME"),
          }
        : {}),
      ...Airtable.defaultOptions,
      ...options,
    };
  }

  /**
   * Reconfigure the Airtable client
   *
   * @param {AirtableOptions} options Airtable client configuration
   * @returns
   * @memberof Airtable
   */
  configure(options: AirtableOptions): Airtable {
    this.#options = { ...this.#options, ...options };
    return this;
  }

  /**
   * Set the Airtable client base ID
   *
   * @param {string} baseId Airtable base
   * @returns
   * @memberof Airtable
   */
  base(baseId: string): Airtable {
    this.#options.baseId = baseId;
    return this;
  }

  /**
   * Set the Airtable table name
   *
   * @param {string} tableName
   * @returns
   * @memberof Airtable
   */
  table(tableName: string): Airtable {
    this.#options.tableName = tableName;
    return this;
  }

  /**
   * List records from selected base and table
   *
   * @template T
   * @param {SelectOptions} [options={}]
   * @returns
   * @memberof Airtable
   */
  select<T extends FieldSet<string>>(
    options: SelectOptions<keyof T> = {}
  ): Promise<SelectResult<T>> {
    return this.request<SelectResult<T>>({
      url: this.getRequestUrl(options),
    });
  }

  /**
   * Retrieve record from selected base and table
   *
   * @template T
   * @param {string} id
   * @returns
   * @memberof Airtable
   */
  find<T extends FieldSet<string>>(id: string): Promise<TableRecord<T>> {
    return this.request<TableRecord<T>>({
      url: this.getRequestUrl({}, id),
    });
  }

  /**
   * Create record for selected base and table
   *
   * @template T
   * @param {T} data
   * @param {RecordOptions} [options]
   * @returns {Promise<TableRecord<T>>}
   * @memberof Airtable
   */
  create<T extends FieldSet<string>>(
    data: T,
    options?: RecordOptions
  ): Promise<TableRecord<T>>;

  /**
   * Create multiple records for selected base and table
   *
   * @template T
   * @param {T[]} data
   * @param {RecordOptions} [options]
   * @returns {Promise<TableRecords<T>>}
   * @memberof Airtable
   */
  create<T extends FieldSet<string>>(
    data: T[],
    options?: RecordOptions
  ): Promise<TableRecords<T>>;

  create<T extends FieldSet<string>>(
    data: T | T[],
    options: RecordOptions = {}
  ) {
    if (data instanceof Array) {
      return this.jsonRequest<TableRecords<T>>({
        url: this.getRequestUrl(),
        method: "POST",
        jsonBody: {
          records: data.map((fields) => ({ fields })),
          ...options,
        },
      });
    }

    return this.jsonRequest<TableRecord<T>>({
      url: this.getRequestUrl(),
      method: "POST",
      jsonBody: { fields: data, ...options },
    });
  }

  /**
   * Update multiple for selected base and table
   *
   * @template T
   * @param {TableRecord<T>[]} records
   * @param {RecordOptions} [options]
   * @returns {Promise<TableRecords<T>>}
   * @memberof Airtable
   */
  update<T extends FieldSet<string>>(
    records: TableRecord<T>[],
    options?: RecordOptions
  ): Promise<TableRecords<T>>;

  /**
   * Update single records for selected base and table
   *
   * @template T
   * @param {string} id
   * @param {T} [record]
   * @param {RecordOptions} [options]
   * @returns {Promise<TableRecord<T>>}
   * @memberof Airtable
   */
  update<T extends FieldSet<string>>(
    id: string,
    record: T,
    options?: RecordOptions
  ): Promise<TableRecord<T>>;

  update<T extends FieldSet<string>>(
    idOrRecords: string | TableRecord<T>[],
    record?: T | RecordOptions,
    options?: RecordOptions
  ) {
    if (typeof idOrRecords === "string") {
      const id = idOrRecords;
      const fields = record;
      return this.updateOrReplace<T>({
        id,
        data: { fields } as TableRecord<T>,
        options,
        replace: false,
      });
    }

    const records = idOrRecords;
    return this.updateOrReplace<T>({
      data: { records },
      options,
      replace: false,
    });
  }

  /**
   * Replace multiple for selected base and table
   *
   * @template T
   * @param {TableRecord<T>[]} records
   * @param {RecordOptions} [options]
   * @returns {Promise<TableRecords<T>>}
   * @memberof Airtable
   */
  replace<T extends FieldSet<string>>(
    records: TableRecord<T>[],
    options?: RecordOptions
  ): Promise<TableRecords<T>>;

  /**
   * Replace single records for selected base and table
   *
   * @template T
   * @param {string} id
   * @param {T} [record]
   * @param {RecordOptions} [options]
   * @returns {Promise<TableRecord<T>>}
   * @memberof Airtable
   */
  replace<T extends FieldSet<string>>(
    id: string,
    record: T,
    options?: RecordOptions
  ): Promise<TableRecord<T>>;

  replace<T extends FieldSet<string>>(
    idOrRecords: string | TableRecord<T>[],
    record?: T | RecordOptions,
    options?: RecordOptions
  ) {
    if (typeof idOrRecords === "string") {
      const id = idOrRecords;
      const fields = record;
      return this.updateOrReplace<T>({
        id,
        data: { fields } as TableRecord<T>,
        options,
        replace: true,
      });
    }

    const records = idOrRecords;
    return this.updateOrReplace<T>({
      data: { records },
      options,
      replace: true,
    });
  }

  /**
   * Delete record from selected base and table
   *
   * @param {string} id
   * @returns {Promise<DeletedRecord>}
   * @memberof Airtable
   */
  delete(id: string): Promise<DeletedRecord>;

  /**
   * Delete multiple records from selected base and table
   *
   * @param {string[]} ids
   * @returns {Promise<DeletedRecords>}
   * @memberof Airtable
   */
  delete(ids: string[]): Promise<DeletedRecords>;

  delete(ids: string | string[]) {
    return this.request<DeletedRecord | DeletedRecords>({
      url: this.getRequestUrl({}, Array.isArray(ids) ? "" : ids),
      method: "DELETE",
      headers: {
        ["Content-Type"]: "application/x-www-form-urlencoded",
      },
      ...(Array.isArray(ids)
        ? {
            body: ids.map((id) => `records[]=${id}`).join("&"),
          }
        : {}),
    });
  }

  private getAuthHeader(): HeadersInit {
    return {
      ["Authorization"]: `Bearer ${this.#options.apiKey}`,
    };
  }

  private getRequestUrl(
    query: Record<string, any> = {},
    ...segments: string[]
  ) {
    const { apiKey, endpointUrl, baseId, tableName } = this.#options;

    if (!apiKey) {
      throw new AirtableError({
        message: "An API key is required to connect to Airtable",
      });
    }

    if (!endpointUrl) {
      throw new AirtableError({
        message: "Endpoint URL is not defined",
      });
    }

    if (!baseId) {
      throw new AirtableError({ message: "Base ID is not defined" });
    }

    if (!tableName) {
      throw new AirtableError({ message: "Table Name is not defined" });
    }

    const urlSegments = [
      endpointUrl,
      baseId,
      encodeURIComponent(tableName!),
      ...segments,
      ...(hasAnyKey(query) ? ["?", stringify(query)] : []),
    ];

    return urlSegments.join("/");
  }

  private async request<T>({
    url,
    headers,
    ...options
  }: AirtableRequestOptions) {
    console.log(url);

    const response = await fetch(url, {
      headers: { ...this.getAuthHeader(), ...headers },
      ...options,
    });

    if (!response.ok) {
      throw new AirtableError({
        message: `${response.status} ${response.statusText}`,
        stackObject: await response.text(),
        status: response.status,
      });
    }

    return (await response.json()) as T;
  }

  private async jsonRequest<T>({
    headers,
    jsonBody,
    ...options
  }: AirtableRequestOptions) {
    return this.request<T>({
      headers: { ...headers, ["Content-Type"]: "application/json" },
      body: JSON.stringify(jsonBody),
      ...options,
    });
  }

  private updateOrReplace<T extends FieldSet<string>>({
    id,
    data,
    replace,
    options,
  }: UpdateOrReplaceOptions<T>) {
    const method = replace ? "PUT" : "PATCH";

    if (typeof id === "string") {
      return this.jsonRequest<TableRecord<T>>({
        url: this.getRequestUrl({}, id),
        method,
        jsonBody: { ...data, ...options },
      });
    }

    return this.jsonRequest<TableRecords<T>>({
      url: this.getRequestUrl(),
      method,
      jsonBody: { ...data, ...options },
    });
  }

  static defaultOptions: Partial<AirtableOptions> = {
    endpointUrl: "https://api.airtable.com/v0",
  };
}

interface UpdateOrReplaceOptions<T extends FieldSet<string>> {
  id?: string;
  data?: TableRecord<T> | TableRecords<T>;
  replace?: boolean;
  options?: RecordOptions;
}
