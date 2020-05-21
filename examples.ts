import { Airtable, Field } from "./mod.ts";

const airtable = new Airtable({
  apiKey: "keyXXXXXXXXXXXXXX",
  baseId: "appXXXXXXXXXXXXXX",
  tableName: "Some table name",
});

const airtableUsingEnv = new Airtable({
  useEnv: true,
});

const results = await airtable.select();

type Fields = {
  ["Name"]: string;
  ["Age"]: number;
  ["Active"]?: Field.Checkbox;
};
const { records, offset } = await airtable.select<Fields>({
  fields: ["Name", "Age"],
  maxRecords: 420,
  pageSize: 69,
  sort: [
    { field: "Name", direction: "asc" },
    { field: "Age", direction: "desc" },
  ],
  view: "Grid view",
});

const { id, fields, createdTime } = await airtable.find("recXXXXXXXXXXXXXX");

const createOne = await airtable.create({
  ["Name"]: "Griko Nibras",
  ["Age"]: 25,
});

const createMultiple = await airtable.create<Fields>(
  [
    { ["Name"]: "Foo", ["Age"]: 20 },
    { ["Name"]: "Bar", ["Age"]: 15 },
  ],
  { typecast: true }
);

const updateOne = await airtable.update<Fields>("recXXXXXXXXXXXXXX", {
  ["Name"]: "Adult boi",
  ["Age"]: 30,
});

const updateMultiple = await airtable.update<Fields>(
  [
    {
      id: "recXXXXXXXXXXXXXX",
      fields: {
        ["Name"]: "Adult boi",
        ["Age"]: 30,
      },
    },
    {
      id: "recXXXXXXXXXXXXXX",
      fields: {
        ["Name"]: "Yung boi",
        ["Age"]: 15,
      },
    },
  ],
  { typecast: true }
);

const deleteOne = await airtable.delete("recXXXXXXXXXXXXXX");

const deleteMultiple = await airtable.delete([
  "recXXXXXXXXXXXXXX",
  "recXXXXXXXXXXXXXX",
]);
