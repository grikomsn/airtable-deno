export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export type RecordLink = string[];
export type SingleLineText = string;
export type LongText = string;
export type Checkbox = boolean;
export type MultipleSelect<T extends string = string> = T[];
export type SingleSelect<T extends string = string> = T[];
export type Collaborator = {
  id: string;
  email: string;
  name: string;
};
export type Collaborators = Collaborator[];
export type Attachment = {
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
};
export type DateType = Date | string;
export type PhoneNumber = string;
export type Email = string;
export type URL = string;
export type Number = number;
export type Currency = number;
export type Percent = number;
export type Duration = number;
export type Rating = number;
