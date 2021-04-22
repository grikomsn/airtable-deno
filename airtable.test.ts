import { Airtable } from "./airtable.ts";
import { assertEquals } from "./deps.ts";

const airtable = new Airtable({
  apiKey: "keyXXXXXXXXXXXXXX",
  baseId: "appXXXXXXXXXXXXXX",
  tableName: "Humans",
});

Deno.test("getRequestUrl - applies an id as a URL segment", () => {
  const id = "recXXXXXXXXXXXXXX";
  assertEquals(
    airtable.getRequestUrl({}, id),
    "https://api.airtable.com/v0/appXXXXXXXXXXXXXX/Humans/recXXXXXXXXXXXXXX"
  );
});

Deno.test(
  "getRequestUrl - applies filterByFormula as a query param",
  () => {
    assertEquals(
      decodeURIComponent(
        airtable.getRequestUrl({
          filterByFormula: "{Age}='27'",
        })
      ),
      "https://api.airtable.com/v0/appXXXXXXXXXXXXXX/Humans?filterByFormula={Age}='27'"
    );
  }
);

Deno.test(
  "getRequestUrl - converts a list of sort objects to query params",
  () => {
    assertEquals(
      airtable.getRequestUrl({
        sort: [
          {
            field: 'Name',
            direction: 'asc',
          },
          {
            field: 'Age',
            direction: 'desc',
          },
        ],
      }),
      "https://api.airtable.com/v0/appXXXXXXXXXXXXXX/Humans?sort[0][field]=Name&sort[0][direction]=asc&sort[1][field]=Age&sort[1][direction]=desc"
    )
  }
)

Deno.test(
  "getRequestUrl - ignores an empty list of sort objects",
  () => {
    assertEquals(
      airtable.getRequestUrl({
        sort: [],
      }),
      "https://api.airtable.com/v0/appXXXXXXXXXXXXXX/Humans"
    )
  }
)

Deno.test(
  "getRequestUrl - applies multiple query params correctly",
  () => {
    assertEquals(
      decodeURIComponent(
        airtable.getRequestUrl({
          filterByFormula: "{Age}='27'",
          maxRecords: "50",
          sort: [
            {
              field: 'Name',
              direction: 'asc',
            },
            {
              field: 'Age',
              direction: 'desc',
            },
          ],
          pageSize: 30,
        })
      ),
      "https://api.airtable.com/v0/appXXXXXXXXXXXXXX/Humans?sort[0][field]=Name&sort[0][direction]=asc&sort[1][field]=Age&sort[1][direction]=desc&filterByFormula={Age}='27'&maxRecords=50&pageSize=30"
    );
  }
);
