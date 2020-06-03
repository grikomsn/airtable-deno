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
 * @copyright MIT License Copyright (c) 2020 [Griko Nibras](https://github.com/grikomsn)
 * @export
 * @class Airtable
 */
export class Airtable {
  #options: AirtableOptions;

  /**
   * Creates an instance of Airtable client
   *
   * ```ts
   * const airtable = new Airtable()
   * const airtable = new Airtable({ useEnv: true })
   * const airtable = new Airtable({
   *   apiKey: "keyXXXXXXXXXXXXXX",
   *   baseId: "appXXXXXXXXXXXXXX",
   *   tableName: "Some table name",
   * })
   * ```
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
   * ```ts
   * airtable.configure({
   *   apiKey: "keyXXXXXXXXXXXXXX",
   *   baseId: "appXXXXXXXXXXXXXX",
   *   tableName: "Some table name",
   * })
   * ```
   *
   * @param {AirtableOptions} options Airtable client configuration
   * @returns {Airtable} current Airtable client
   * @memberof Airtable
   */
  configure(options: AirtableOptions): Airtable {
    this.#options = { ...this.#options, ...options };
    return this;
  }

  /**
   * Returns new Airtable client with defined base ID
   *
   * ```ts
   * const airtable = new Airtable()
   * const airtableWithNewBaseId = airtable.base("appXXXXXXXXXXXXXX")
   * ```
   *
   * @param {string} baseId Airtable base
   * @returns {Airtable} current Airtable client
   * @memberof Airtable
   */
  base(baseId: string): Airtable {
    return new Airtable({ ...this.#options, baseId });
  }

  /**
   * Returns new Airtable client with defined table name
   *
   * ```ts
   * const airtable = new Airtable()
   * const airtableWithNewTableName = airtable.table("Some table name")
   * ```
   *
   * @param {string} tableName
   * @returns {Airtable} current Airtable client
   * @memberof Airtable
   */
  table(tableName: string): Airtable {
    return new Airtable({ ...this.#options, tableName });
  }

  /**
   * List records from selected base and table
   *
   * ```ts
   * const results = await airtable.select()
   * ```
   *
   * @template T table field types
   * @param {SelectOptions} [options={}] select query options, read more on the [Airtable API documentation](https://airtable.com/api)
   * @returns {Promise<SelectResult<T>>} select query result
   * @memberof Airtable
   */
  select<T extends FieldSet>(
    options: SelectOptions<keyof T> = {}
  ): Promise<SelectResult<T>> {
    return this.request<SelectResult<T>>({
      url: this.getRequestUrl(options),
    });
  }

  /**
   * Retrieve record from selected base and table
   *
   * ```ts
   * const record = await airtable.find("recXXXXXXXXXXXXXX")
   * const { id, fields, createdTime } = await airtable.find("recXXXXXXXXXXXXXX")
   * ```
   *
   * @template T table field types
   * @param {string} id table record id
   * @returns {Promise<TableRecord<T>>} table record result
   * @memberof Airtable
   */
  find<T extends FieldSet>(id: string): Promise<TableRecord<T>> {
    return this.request<TableRecord<T>>({
      url: this.getRequestUrl({}, id),
    });
  }

  /**
   * Create record for selected base and table
   *
   * ```ts
   *  const createOne = await airtable.create({
   *    ["Name"]: "Griko Nibras",
   *    ["Age"]: 25,
   *  });
   * ```
   *
   * @template T table field types
   * @param {T} data record values
   * @param {RecordOptions} [options] record creations options, read more on the [Airtable API documentation](https://airtable.com/api)
   * @returns {Promise<TableRecord<T>>} created record values
   * @memberof Airtable
   */
  create<T extends FieldSet>(
    data: T,
    options?: RecordOptions
  ): Promise<TableRecord<T>>;

  /**
   * Create multiple records for selected base and table
   *
   * ```ts
   * const createMultiple = await airtable.create(
   *   [
   *     { ["Name"]: "Foo", ["Age"]: 20 },
   *     { ["Name"]: "Bar", ["Age"]: 15 },
   *   ],
   *   { typecast: true }
   * );
   * ```
   *
   * @template T table field types
   * @param {T[]} data array of record values
   * @param {RecordOptions} [options] record creations options, read more on the [Airtable API documentation](https://airtable.com/api)
   * @returns {Promise<TableRecords<T>>} array of created record values
   * @memberof Airtable
   */
  create<T extends FieldSet>(
    data: T[],
    options?: RecordOptions
  ): Promise<TableRecords<T>>;

  create<T extends FieldSet>(data: T | T[], options: RecordOptions = {}) {
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
   * ```ts
   * const updateMultiple = await airtable.update(
   *   [
   *     {
   *       id: "recXXXXXXXXXXXXXX",
   *       fields: { ["Name"]: "Adult boi", ["Age"]: 30 },
   *     },
   *     {
   *       id: "recXXXXXXXXXXXXXX",
   *       fields: { ["Name"]: "Yung boi", ["Age"]: 15 },
   *     },
   *   ],
   *   { typecast: true }
   * );
   * ```
   *
   * @template T table field types
   * @param {TableRecord<T>[]} records array of record values to be updated
   * @param {RecordOptions} [options] record updating options, read more on the [Airtable API documentation](https://airtable.com/api)
   * @returns {Promise<TableRecords<T>>} array of updated record values
   * @memberof Airtable
   */
  update<T extends FieldSet>(
    records: TableRecord<T>[],
    options?: RecordOptions
  ): Promise<TableRecords<T>>;

  /**
   * Update single records for selected base and table
   *
   * ```ts
   * const updateOne = await airtable.update("recXXXXXXXXXXXXXX", {
   *   ["Name"]: "Adult boi",
   *   ["Age"]: 30,
   * });
   * ```
   *
   * @template T table field types
   * @param {string} id record id
   * @param {T} record record values
   * @param {RecordOptions} [options] record updating options, read more on the [Airtable API documentation](https://airtable.com/api)
   * @returns {Promise<TableRecords<T>>} updated record values
   * @memberof Airtable
   */
  update<T extends FieldSet>(
    id: string,
    record: T,
    options?: RecordOptions
  ): Promise<TableRecord<T>>;

  update<T extends FieldSet>(
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
   * ```ts
   * const replaceMultiple = await airtable.replace(
   *   [
   *     {
   *       id: "recXXXXXXXXXXXXXX",
   *       fields: { ["Name"]: "Adult boi", ["Age"]: 30 },
   *     },
   *     {
   *       id: "recXXXXXXXXXXXXXX",
   *       fields: { ["Name"]: "Yung boi", ["Age"]: 15 },
   *     },
   *   ],
   *   { typecast: true }
   * );
   * ```
   *
   * @template T table field types
   * @param {TableRecord<T>[]} records array of record values to be replaced
   * @param {RecordOptions} [options] record replacing options, read more on the [Airtable API documentation](https://airtable.com/api)
   * @returns {Promise<TableRecords<T>>} array of replaced record values
   * @memberof Airtable
   */
  replace<T extends FieldSet>(
    records: TableRecord<T>[],
    options?: RecordOptions
  ): Promise<TableRecords<T>>;

  /**
   * Replace single records for selected base and table
   *
   * ```ts
   * const replaceOne = await airtable.update("recXXXXXXXXXXXXXX", {
   *   ["Name"]: "Adult boi",
   *   ["Age"]: 30,
   * });
   * ```
   *
   * @template T table field types
   * @param {string} id record id
   * @param {T} record record values
   * @param {RecordOptions} [options] record replacing options, read more on the [Airtable API documentation](https://airtable.com/api)
   * @returns {Promise<TableRecords<T>>} replaced record values
   * @memberof Airtable
   */
  replace<T extends FieldSet>(
    id: string,
    record: T,
    options?: RecordOptions
  ): Promise<TableRecord<T>>;

  replace<T extends FieldSet>(
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
   * ```ts
   * const deleteOne = await airtable.delete("recXXXXXXXXXXXXXX");
   * ```
   *
   * @param {string} id record id
   * @returns {Promise<DeletedRecord>} deleted record result
   * @memberof Airtable
   */
  delete(id: string): Promise<DeletedRecord>;

  /**
   * Delete multiple records from selected base and table
   *
   * ```ts
   * const deleteMultiple = await airtable.delete([
   *   "recXXXXXXXXXXXXXX",
   *   "recXXXXXXXXXXXXXX",
   * ]);
   * ```
   *
   * @param {string[]} ids record ids
   * @returns {Promise<DeletedRecords>} deleted records result
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

  private updateOrReplace<T extends FieldSet>({
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

interface UpdateOrReplaceOptions<T extends FieldSet> {
  id?: string;
  data?: TableRecord<T> | TableRecords<T>;
  replace?: boolean;
  options?: RecordOptions;
}
