export interface AirtableErrorProps {
  message: string;
  stackObject?: any;
  status?: number;
}

export class AirtableError<T extends any> extends Error {
  message: string;
  stackObject?: T;
  status?: number;

  constructor({ message, stackObject, status }: AirtableErrorProps) {
    super(message);

    this.message = message;
    this.stackObject = stackObject;
    this.status = status;

    this.name = "Airtable Error";
    this.stack = JSON.stringify(stackObject);
  }

  toString() {
    return JSON.stringify({ ...this });
  }
}
