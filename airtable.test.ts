import { Airtable } from "./airtable.ts";
import { assertEquals } from "./deps.ts";

const airtable = new Airtable({
  apiKey: "keyXXXXXXXXXXXXXX",
  baseId: "appXXXXXXXXXXXXXX",
  tableName: "Humans",
});

Deno.test("getRequestUrl - applies an id as a URL segment", async () => {
  const id = "recXXXXXXXXXXXXXX";
  assertEquals(
    airtable.getRequestUrl({}, id),
    "https://api.airtable.com/v0/appXXXXXXXXXXXXXX/Humans/recXXXXXXXXXXXXXX"
  );
});

Deno.test(
  "getRequestUrl - applies filterByFormula as a query param",
  async () => {
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
  "getRequestUrl - applies multiple query params correctly",
  async () => {
    assertEquals(
      decodeURIComponent(
        airtable.getRequestUrl({
          filterByFormula: "{Age}='27'",
          maxRecords: "50",
          pageSize: 30,
        })
      ),
      "https://api.airtable.com/v0/appXXXXXXXXXXXXXX/Humans?filterByFormula={Age}='27'&maxRecords=50&pageSize=30"
    );
  }
);
