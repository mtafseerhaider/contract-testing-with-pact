"use strict";

const { Matchers } = require("@pact-foundation/pact");
const { getClients, postClient } = require("../../../src/consumer");
const path = require("path");
const { Verifier } = require("@pact-foundation/pact");
const { server, importData } = require("../../../src/provider");
const SERVER_URL = "http://localhost:8081";

server.listen(8081, () => {
  importData();
  console.log(`Clients Service listening on ${SERVER_URL}`);
});

describe("Clients Service", () => {
  const GET_EXPECTED_BODY = [
    {
      firstName: "Zahid",
      lastName: "Nouman",
      age: 35,
      id: 1,
    },
    {
      firstName: "Ali",
      lastName: "Khan",
      age: 30,
      id: 2,
    },
    {
      firstName: "Alia",
      lastName: "Bhatt",
      age: 24,
      id: 3,
    },
  ];

  afterEach(() => provider.verify());

  describe("GET Clients", () => {
    beforeEach(() => {
      const interaction = {
        state: "I have a list of clients",
        uponReceiving: "a request for all clients",
        withRequest: {
          method: "GET",
          path: "/clients",
          headers: {
            Accept: "application/json, text/plain, */*",
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: GET_EXPECTED_BODY,
        },
      };
      return provider.addInteraction(interaction);
    });

    test("returns correct body, header and statusCode", async () => {
      const response = await getClients();
      expect(response.headers["content-type"]).toBe(
        "application/json; charset=utf-8"
      );
      expect(response.data).toEqual(GET_EXPECTED_BODY);
      expect(response.status).toEqual(200);
    });
  });

  const POST_BODY = {
    firstName: "Tafseer",
    lastName: "Haider",
    age: 32,
  };

  const POST_EXPECTED_BODY = {
    firstName: POST_BODY.firstName,
    lastName: POST_BODY.lastName,
    age: POST_BODY.age,
    id: 3,
  };

  describe("POST Client", () => {
    beforeEach(() => {
      const interaction = {
        state: "I create a new client",
        uponReceiving: "a request to create client with firstname and lastname",
        withRequest: {
          method: "POST",
          path: "/clients",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: POST_BODY,
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(POST_EXPECTED_BODY).contents,
        },
      };
      return provider.addInteraction(interaction);
    });
    test("returns correct body, header and statusCode", async () => {
      const response = await postClient(POST_BODY);
      console.log(response.data);
      expect(response.data.id).toEqual(3);
      expect(response.status).toEqual(200);
    });
  });

  describe("Clients Service Verification", () => {
    it("validates the expectations of Client Service", () => {
      let opts = {
        provider: "Clients Service",
        logLevel: "DEBUG",
        providerBaseUrl: SERVER_URL,
        pactUrls: [
          "http://localhost:8080/pacts/provider/ClientsService/consumer/Frontend/latest",
        ],
        consumerVersionTags: ["dev"],
        providerVersionTags: ["dev"],
        publishVerificationResult: true,
        providerVersion: "1.0.1",
      };

      return new Verifier(opts).verifyProvider().then((output) => {
        console.log("Pact Verification Complete!");
        console.log(output);
      });
    });
  });
});
