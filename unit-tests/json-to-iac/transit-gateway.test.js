const { assert } = require("chai");
const {
  formatTgw,
  formatTgwConnection,
  tgwTf,
} = require("../../client/src/lib/json-to-iac/transit-gateway");
const slzNetwork = require("../data-files/slz-network.json");

describe("transit gateway", () => {
  describe("formatTgw", () => {
    it("should return correctly formatted transit gateway", () => {
      let actualData = formatTgw(
        {
          name: "transit-gateway",
          resource_group: "slz-service-rg",
          global: false,
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_tg_gateway" "transit_gateway" {
  name           = "\${var.prefix}-transit-gateway"
  location       = var.region
  global         = false
  resource_group = ibm_resource_group.slz_service_rg.id
  timeouts {
    create = "30m"
    delete = "30m"
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatTgwConnection", () => {
    it("should return correctly formatted transit gateway", () => {
      let actualData = formatTgwConnection(
        {
          name: "transit-gateway",
          resource_group: "slz-service-rg",
          global: false,
          connections: [
            {
              tgw: "transit-gateway",
              vpc: "management",
            },
          ],
        }.connections[0],
        slzNetwork
      );
      let expectedData = `
resource "ibm_tg_connection" "transit_gateway_to_management_connection" {
  gateway      = ibm_tg_gateway.transit_gateway.id
  network_type = "vpc"
  name         = "\${var.prefix}-transit-gateway-management-hub-connection"
  network_id   = module.management_vpc.crn
  timeouts {
    create = "30m"
    delete = "30m"
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return correctly formatted transit gateway when connecting a vpc via crn", () => {
      let actualData = formatTgwConnection(
        {
          name: "transit-gateway",
          resource_group: "slz-service-rg",
          global: false,
          connections: [
            {
              tgw: "transit-gateway",
              vpc: "management",
            },
            {
              tgw: "transit-gateway",
              crn: "crn:v1:bluemix:public:is:us-south:a/aaaaaaa::vpc:aaaa-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            },
          ],
        }.connections[1],
        slzNetwork
      );
      let expectedData = `
resource "ibm_tg_connection" "transit_gateway_to_aaaa_aaaaaaaa_aaaa_aaaa_aaaa_aaaaaaaaaaaa_connection" {
  gateway      = ibm_tg_gateway.transit_gateway.id
  network_type = "vpc"
  name         = "\${var.prefix}-transit-gateway-aaaa-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa-hub-connection"
  network_id   = "crn:v1:bluemix:public:is:us-south:a/aaaaaaa::vpc:aaaa-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
  timeouts {
    create = "30m"
    delete = "30m"
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return correctly formatted transit gateway when connected to power", () => {
      let actualData = formatTgwConnection(
        {
          name: "transit-gateway",
          resource_group: "slz-service-rg",
          global: false,
          connections: [
            {
              tgw: "transit-gateway",
              power: "dev",
            },
          ],
        }.connections[0],
        slzNetwork
      );
      let expectedData = `
resource "ibm_tg_connection" "transit_gateway_to_power_workspace_dev_connection" {
  gateway      = ibm_tg_gateway.transit_gateway.id
  network_type = "power_virtual_server"
  name         = "\${var.prefix}-transit-gateway-power-dev-hub-connection"
  network_id   = ibm_resource_instance.power_vs_workspace_dev.resource_crn
  timeouts {
    create = "30m"
    delete = "30m"
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("tgwTf", () => {
    it("should return correctly formatted transit gateway", () => {
      let actualData = tgwTf(slzNetwork);
      let expectedData = `##############################################################################
# Transit Gateway Transit Gateway
##############################################################################

resource "ibm_tg_gateway" "transit_gateway" {
  name           = "\${var.prefix}-transit-gateway"
  location       = var.region
  global         = false
  resource_group = ibm_resource_group.slz_service_rg.id
  timeouts {
    create = "30m"
    delete = "30m"
  }
}

resource "ibm_tg_connection" "transit_gateway_to_management_connection" {
  gateway      = ibm_tg_gateway.transit_gateway.id
  network_type = "vpc"
  name         = "\${var.prefix}-transit-gateway-management-hub-connection"
  network_id   = module.management_vpc.crn
  timeouts {
    create = "30m"
    delete = "30m"
  }
}

resource "ibm_tg_connection" "transit_gateway_to_workload_connection" {
  gateway      = ibm_tg_gateway.transit_gateway.id
  network_type = "vpc"
  name         = "\${var.prefix}-transit-gateway-workload-hub-connection"
  network_id   = module.workload_vpc.crn
  timeouts {
    create = "30m"
    delete = "30m"
  }
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });

    it("should return terraform for multiple transit gateways", () => {
      let config = { ...slzNetwork };
      config.transit_gateways = [
        {
          name: "transit-gateway",
          resource_group: "service-rg",
          global: false,
          connections: [
            {
              tgw: "transit-gateway",
              vpc: "management",
            },
            {
              tgw: "transit-gateway",
              vpc: "workload",
            },
          ],
        },
        {
          global: true,
          connections: [
            {
              tgw: "m",
              vpc: "management",
            },
          ],
          resource_group: "service-rg",
          name: "m",
          crns: [],
        },
      ];
      let actualData = tgwTf(config);
      let expectedData = `##############################################################################
# Transit Gateway Transit Gateway
##############################################################################

resource "ibm_tg_gateway" "transit_gateway" {
  name           = "\${var.prefix}-transit-gateway"
  location       = var.region
  global         = false
  resource_group = ibm_resource_group.service_rg.id
  timeouts {
    create = "30m"
    delete = "30m"
  }
}

resource "ibm_tg_connection" "transit_gateway_to_management_connection" {
  gateway      = ibm_tg_gateway.transit_gateway.id
  network_type = "vpc"
  name         = "\${var.prefix}-transit-gateway-management-hub-connection"
  network_id   = module.management_vpc.crn
  timeouts {
    create = "30m"
    delete = "30m"
  }
}

resource "ibm_tg_connection" "transit_gateway_to_workload_connection" {
  gateway      = ibm_tg_gateway.transit_gateway.id
  network_type = "vpc"
  name         = "\${var.prefix}-transit-gateway-workload-hub-connection"
  network_id   = module.workload_vpc.crn
  timeouts {
    create = "30m"
    delete = "30m"
  }
}

##############################################################################

##############################################################################
# M Transit Gateway
##############################################################################

resource "ibm_tg_gateway" "m" {
  name           = "\${var.prefix}-m"
  location       = var.region
  global         = true
  resource_group = ibm_resource_group.service_rg.id
  timeouts {
    create = "30m"
    delete = "30m"
  }
}

resource "ibm_tg_connection" "m_to_management_connection" {
  gateway      = ibm_tg_gateway.m.id
  network_type = "vpc"
  name         = "\${var.prefix}-m-management-hub-connection"
  network_id   = module.management_vpc.crn
  timeouts {
    create = "30m"
    delete = "30m"
  }
}

##############################################################################
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should create correct tf for multiple tgw"
      );
    });
  });
});
