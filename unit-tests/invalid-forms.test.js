const { assert } = require("chai");
const { state, invalidForms } = require("../client/src/lib");
const failingComponents = require("./data-files/every-component-fails.json");
const craig = require("./data-files/craig-json.json");
const failingSubComponents = require("./data-files/sub-components-fail.json");

describe("invalidForms", () => {
  it("should return a list of disabled components", () => {
    let updatedState = new state();
    updatedState.store.json = failingComponents;
    updatedState.updateCallback = () => {};
    updatedState.update();
    let expectedData = [
      "key_management",
      "object_storage",
      "secrets_manager",
      "atracker",
      "event_streams",
      "appid",
      "vpcs",
      "/form/nacls",
      "/form/subnets",
      "routing_tables",
      "transit_gateways",
      "security_groups",
      "virtual_private_endpoints",
      "vpn_gateways",
      "clusters",
      "ssh_keys",
      "vsi",
      "/form/observability",
      "power",
      "power_instances",
      "power_volumes",
      "load_balancers",
      "dns",
      "vpn_servers",
      "access_groups",
      "/form/cbr",
    ];
    let actualData = invalidForms(updatedState);
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return failing list of forms"
    );
  });
  it("should return a list of disabled components when no components fail", () => {
    let updatedState = new state();
    updatedState.store.json = craig;
    craig.vpn_servers = [];
    updatedState.updateCallback = () => {};
    updatedState.update();
    let expectedData = [];
    let actualData = invalidForms(updatedState);
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return failing list of forms"
    );
  });
  it("should return a list of disabled components when sub components fail", () => {
    let updatedState = new state();
    updatedState.store.json = failingSubComponents;
    updatedState.updateCallback = () => {};
    updatedState.update();
    let expectedData = [
      "key_management",
      "object_storage",
      "routing_tables",
      "clusters",
      "vsi",
      "power",
      "power_instances",
      "power_volumes",
      "dns",
      "vpn_servers",
      "access_groups",
      "/form/cbr",
    ];
    let actualData = invalidForms(updatedState);
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return failing list of forms"
    );
  });
  it("should return a list of disabled components when sub components fail", () => {
    let updatedState = new state();
    updatedState.store.json = failingSubComponents;
    updatedState.updateCallback = () => {};
    updatedState.update();
    updatedState.store.json.key_management[0].keys[0].name = "good";
    let expectedData = [
      "object_storage",
      "routing_tables",
      "clusters",
      "vsi",
      "power",
      "power_instances",
      "power_volumes",
      "dns",
      "vpn_servers",
      "access_groups",
      "/form/cbr",
    ];
    let actualData = invalidForms(updatedState);
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return failing list of forms"
    );
    // dynamic policies and cbr exclusions and dns custom resolvers
    updatedState.store.json.access_groups[0].policies = [];
    updatedState.store.json.access_groups[0].dynamic_policies = [
      {
        name: "@@@@",
      },
    ];
    updatedState.store.json.cbr_zones[0].addresses = [];
    updatedState.store.json.cbr_zones[0].exclusions = [
      {
        name: "@@@",
      },
    ];
    updatedState.store.json.dns[0].zones = [];
    updatedState.store.json.dns[0].custom_resolvers = [
      {
        name: "@@@",
      },
    ];
    actualData = invalidForms(updatedState);
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return failing list of forms"
    );
    // cbr rules contexts, dns records
    updatedState.store.json.cbr_zones[0].exclusions = [];
    updatedState.store.json.dns[0].custom_resolvers = [];
    updatedState.store.json.dns[0].records = [
      {
        name: "@@@",
      },
    ];
    updatedState.store.json.cbr_rules.push({
      name: "good",
      description: "",
      api_type_id: "good",
      contexts: [
        {
          name: "@@@",
        },
      ],
      resource_attributes: [],
      tags: [],
    });
    actualData = invalidForms(updatedState);
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return failing list of forms"
    );
    // cbr resource attributes
    updatedState.store.json.cbr_rules[0].contexts = [];
    updatedState.store.json.cbr_rules[0].resource_attributes = [
      {
        name: "@@@",
      },
    ];
    actualData = invalidForms(updatedState);
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return failing list of forms"
    );
    // tags
    updatedState.store.json.cbr_rules[0].resource_attributes = [];
    updatedState.store.json.cbr_rules[0].tags = [
      {
        name: "@@@",
      },
    ];
    actualData = invalidForms(updatedState);
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return failing list of forms"
    );
  });
  it("should return a list of disabled components when no components invalid and vpc has default acl name", () => {
    let updatedState = new state();
    updatedState.store.json = craig;
    craig.vpn_servers = [];
    updatedState.store.json.vpcs[0].default_network_acl_name = "frog";
    updatedState.store.json.vpcs[0].default_routing_table_name = "frog";
    updatedState.store.json.vpcs[0].default_security_group_name = "frog";
    updatedState.updateCallback = () => {};
    updatedState.update();
    let expectedData = [];
    let actualData = invalidForms(updatedState);
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return failing list of forms"
    );
    updatedState.store.json.vpcs[0].default_network_acl_name = null;
    updatedState.store.json.vpcs[0].default_routing_table_name = null;
    updatedState.store.json.vpcs[0].default_security_group_name = null;
  });
});
