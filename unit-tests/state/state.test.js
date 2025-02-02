const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
const { splat } = require("lazy-z");
const json = require("../data-files/craig-json.json");
const hardSetData = require("../data-files/expected-hard-set.json");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("state util functions", () => {
  describe("setStoreValue", () => {
    it("should set a store value", () => {
      let state = newState();
      state.setStoreValue("jsonInCodeMirror", true);
      assert.isTrue(state.store.jsonInCodeMirror, "it should be set");
    });
  });
  describe("toggleStoreValue", () => {
    it("should toggle a boolean store value", () => {
      let state = newState();
      state.toggleStoreValue("hideCodeMirror");
      assert.isTrue(state.store.hideCodeMirror, "it should toggle value");
    });
  });
  describe("addClusterRules", () => {
    it("should add rules and skip duplicate rules", () => {
      let state = newState();
      state.store.json.vpcs[0].acls[0].rules.push({
        name: "roks-create-worker-nodes-inbound",
      });
      state.addClusterRules("management", "management");
      assert.deepEqual(
        splat(state.store.json.vpcs[0].acls[0].rules, "name"),
        [
          "allow-ibm-inbound",
          "allow-ibm-outbound",
          "allow-all-network-inbound",
          "allow-all-network-outbound",
          "roks-create-worker-nodes-inbound",
          "roks-create-worker-nodes-outbound",
          "roks-nodes-to-service-inbound",
          "roks-nodes-to-service-outbound",
          "allow-app-incoming-traffic-requests",
          "allow-app-outgoing-traffic-requests",
          "allow-lb-incoming-traffic-requests",
          "allow-lb-outgoing-traffic-requests",
        ],
        "it should add non duplicate rules"
      );
    });
  });
  describe("copySecurityGroup", () => {
    it("should copy acl from one vpc to another", () => {
      let state = newState();
      state.store.json.vpcs[1].acls = [];
      state.copySecurityGroup("management-vpe", "workload");
      assert.deepEqual(
        splat(state.store.json.security_groups, "name")[3],
        "management-vpe-copy",
        "it should copy"
      );
    });
  });
  describe("copyNetworkAcl", () => {
    it("should copy acl from one vpc to another", () => {
      let state = newState();
      state.store.json.vpcs[1].acls = [];
      state.copyNetworkAcl("management", "management", "workload");
      assert.deepEqual(
        splat(state.store.json.vpcs[1].acls, "name"),
        ["management-copy"],
        "it should copy"
      );
    });
  });
  describe("copyRule", () => {
    it("should copy one rule from vpc to another", () => {
      let state = newState();
      state.store.json.vpcs[1].acls[0].rules = [];
      state.copyRule(
        "management",
        "management",
        "allow-all-network-outbound",
        "workload"
      );
      assert.deepEqual(
        splat(state.store.json.vpcs[1].acls[0].rules, "name"),
        ["allow-all-network-outbound"],
        "it should copy"
      );
    });
  });
  describe("copySgRule", () => {
    it("should copy one rule from sg to another", () => {
      let state = newState();
      state.store.json.security_groups[0].rules = [];
      state.copySgRule("workload-vpe", "allow-vpc-outbound", "management-vpe");
      assert.deepEqual(
        splat(state.store.json.security_groups[0].rules, "name"),
        ["allow-vpc-outbound"],
        "it should copy"
      );
    });
  });
  describe("getAllSubnets", () => {
    it("should get all subnets", () => {
      let expectedData = [
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.0.0/29",
          name: "vsi-zone-1",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.0.16/28",
          name: "vpn-zone-1",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "management",
          zone: 2,
          cidr: "10.20.0.0/29",
          name: "vsi-zone-2",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.30.0.0/29",
          name: "vsi-zone-3",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.0.48/29",
          name: "vpe-zone-1",
          resource_group: "management-rg",
          network_acl: "management",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "management",
          zone: 2,
          cidr: "10.20.0.16/29",
          name: "vpe-zone-2",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.30.0.16/29",
          name: "vpe-zone-3",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "workload",
          zone: 1,
          cidr: "10.40.0.0/28",
          name: "vsi-zone-1",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "workload",
          zone: 2,
          cidr: "10.50.0.0/28",
          name: "vsi-zone-2",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "workload",
          zone: 3,
          cidr: "10.60.0.0/28",
          name: "vsi-zone-3",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "workload",
          zone: 1,
          cidr: "10.40.0.32/29",
          name: "vpe-zone-1",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "workload",
          zone: 2,
          cidr: "10.50.0.32/29",
          name: "vpe-zone-2",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: false,
        },
        {
          vpc: "workload",
          zone: 3,
          cidr: "10.60.0.32/29",
          name: "vpe-zone-3",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: false,
        },
      ];
      let state = new newState(true);
      let actualData = state.getAllSubnets();
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("hardSetJson", () => {
    it("should set JSON data if valid", () => {
      let state = newState();
      state.setUpdateCallback(() => {});
      delete json.ssh_keys[1]; // remove extra ssh key that should not be there lol
      state.hardSetJson({ ...json });
      assert.deepEqual(
        state.store.json,
        { ...hardSetData },
        "it should set the store"
      );
      assert.deepEqual(
        state.store.subnetTiers,
        {
          management: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
            { name: "vpn", zones: 1 },
          ],
          workload: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
          ],
        },
        "it should set subnet tiers"
      );
    });
    it("should set JSON data if valid with routing tables", () => {
      let state = newState();
      let rtJson = require("../data-files/craig-json-routing-tables.json");
      state.setUpdateCallback(() => {});
      delete json.ssh_keys[1]; // remove extra ssh key that should not be there lol
      let expectedData = { ...hardSetData };
      expectedData.routing_tables = [
        {
          name: "table",
          routes: [
            {
              routing_table: "table",
              vpc: "management",
            },
          ],
          vpc: "management",
        },
      ];
      state.hardSetJson(rtJson);
      assert.deepEqual(
        state.store.json,
        expectedData,
        "it should set the store"
      );
      assert.deepEqual(
        state.store.subnetTiers,
        {
          management: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
            { name: "vpn", zones: 1 },
          ],
          workload: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
          ],
        },
        "it should set subnet tiers"
      );
    });
    it("should set JSON data if valid with advanced subnet tiers", () => {
      let state = newState();
      let data = require("../data-files/craig-json.json");
      data.vpcs[0].subnets.forEach((subnet) => {
        if (subnet.name.indexOf("vsi-zone") !== -1) {
          subnet.tier = "frog";
        }
      });
      state.setUpdateCallback(() => {});
      delete json.ssh_keys[1]; // remove extra ssh key that should not be there lol
      state.hardSetJson(data);
      assert.deepEqual(state.store.json, data, "it should set the store");
      assert.deepEqual(
        state.store.subnetTiers,
        {
          management: [
            { name: "vpe", zones: 3 },
            { name: "vpn", zones: 1 },
            {
              name: "frog",
              zones: undefined,
              select_zones: [1, 2, 3],
              advanced: true,
              subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            },
          ],
          workload: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
          ],
        },
        "it should set subnet tiers"
      );
    });
    it("should set JSON data if not valid but slz", () => {
      let state = newState();
      state.setUpdateCallback(() => {});
      delete json.ssh_keys[1]; // remove extra ssh key that should not be there lol
      state.hardSetJson({}, true);
      assert.deepEqual(
        state.store.subnetTiers,
        {
          management: [
            { name: "vsi", zones: 3 },
            { name: "vpn", zones: 1 },
            { name: "vpe", zones: 3 },
          ],
          workload: [
            { name: "vsi", zones: 3 },
            { name: "vpe", zones: 3 },
          ],
        },
        "it should set subnet tiers"
      );
    });
    it("should convert permitted networks to vpcs on hard set", () => {
      let state = newState();
      state.setUpdateCallback(() => {});
      json.dns.push({
        name: "dns",
        resource_group: "management-rg",
        zones: [],
        records: [],
        custom_resolvers: [],
      });
      json.dns[0].zones.push({
        name: "hi",
        permitted_networks: ["management"],
      });
      state.hardSetJson({ ...json });
      assert.deepEqual(state.store.json.dns[0].zones[0], {
        instance: "dns",
        name: "hi",
        vpcs: ["management"],
      });
    });
    it("should not convert anything if permitted networks doesn't exist", () => {
      let state = newState();
      json._options.dynamic_subnets = true;
      state.setUpdateCallback(() => {});
      json.dns.push({
        name: "dns",
        resource_group: "management-rg",
        zones: [],
        records: [],
        custom_resolvers: [],
      });
      json.dns[0].zones.push({
        name: "hi",
        vpcs: ["management"],
      });
      state.hardSetJson({ ...json });
      assert.deepEqual(state.store.json.dns[0].zones[0], {
        instance: "dns",
        name: "hi",
        vpcs: ["management"],
      });
      assert.isTrue(
        state.store.json._options.dynamic_subnets,
        "it should be true"
      );
    });
  });
  describe("getAllRuleNames", () => {
    it("should return empty array if no params", () => {
      let state = newState();
      let actualData = state.getAllRuleNames();
      assert.deepEqual(actualData, [], "it should return an empty array");
    });
    it("should return the names of all rules in a security group when no source acl name", () => {
      let state = newState();
      let actualData = state.getAllRuleNames("management-vpe");
      let expectedData = [
        "allow-ibm-inbound",
        "allow-vpc-inbound",
        "allow-vpc-outbound",
        "allow-ibm-tcp-53-outbound",
        "allow-ibm-tcp-80-outbound",
        "allow-ibm-tcp-443-outbound",
      ];
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct rule names"
      );
    });
    it("should return the names of all rules in an acl when two params are passed", () => {
      let state = newState();
      let actualData = state.getAllRuleNames("management", "management");
      let expectedData = [
        "allow-ibm-inbound",
        "allow-ibm-outbound",
        "allow-all-network-inbound",
        "allow-all-network-outbound",
      ];
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct rule names"
      );
    });
  });
  describe("getAllOtherGroups", () => {
    it("should return empty array if rule source is null or empty string", () => {
      let state = newState();
      let actualData = state.getAllOtherGroups({ ruleSource: "" });
      assert.deepEqual(actualData, [], "it should return empty array");
    });
    it("should return all other acl names if rule source and isAclForm", () => {
      let state = newState();
      let actualData = state.getAllOtherGroups(
        { ruleSource: "management" },
        { isAclForm: true }
      );
      assert.deepEqual(
        actualData,
        ["workload"],
        "it should return empty array"
      );
    });
    it("should return all other security groups if rule source and not isAclForm", () => {
      let state = newState();
      let actualData = state.getAllOtherGroups(
        { ruleSource: "management-vpe" },
        { isAclForm: false }
      );
      assert.deepEqual(
        actualData,
        ["workload-vpe", "management-vsi"],
        "it should return empty array"
      );
    });
  });
  describe("getAllResourceKeys", () => {
    it("should get a list of keys from the default pattern", () => {
      let state = newState();
      let actualData = state.getAllResourceKeys();
      assert.deepEqual(
        actualData,
        [
          {
            cos: "atracker-cos",
            key: "cos-bind-key",
            ref: "ibm_resource_key.atracker_cos_object_storage_key_cos_bind_key",
          },
        ],
        "it should return correct data"
      );
      state.store.json.appid = [
        {
          name: "default",
          keys: [
            { name: "test", appid: "default", resource_group: "service-rg" },
          ],
          resource_group: null,
        },
      ];
      actualData = state.getAllResourceKeys();
      assert.deepEqual(
        actualData,
        [
          {
            cos: "atracker-cos",
            key: "cos-bind-key",
            ref: "ibm_resource_key.atracker_cos_object_storage_key_cos_bind_key",
          },
          {
            appid: "default",
            key: "test",
            ref: "ibm_resource_key.default_key_test",
          },
        ],
        "it should return correct data with appid"
      );
      state.store.json.logdna = {
        plan: "lite",
        platform_logs: true,
        resource_group: "service-rg",
        enabled: true,
      };
      state.store.json.sysdig = {
        plan: "lite",
        resource_group: "service-rg",
        enabled: true,
      };
      actualData = state.getAllResourceKeys();
      assert.deepEqual(
        actualData,
        [
          {
            cos: "atracker-cos",
            key: "cos-bind-key",
            ref: "ibm_resource_key.atracker_cos_object_storage_key_cos_bind_key",
          },
          {
            appid: "default",
            key: "test",
            ref: "ibm_resource_key.default_key_test",
          },
          {
            ref: "ibm_resource_key.logdna_key",
            key: "logdna-key",
          },
          {
            ref: "ibm_resource_key.sysdig_key",
            key: "sysdig-key",
          },
        ],
        "it should return correct data with appid"
      );
    });
  });
});
