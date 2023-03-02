const { assert } = require("chai");
const {
  formatVpc,
  formatAddressPrefix,
  formatSubnet,
  formatAcl,
  formatAclRule,
  formatPgw,
  vpcTf,
} = require("../../client/src/lib/json-to-iac/vpc");

describe("vpc", () => {
  describe("formatVpc", () => {
    it("should create vpc terraform", () => {
      let actualData = formatVpc(
        {
          name: "management",
          resource_group: "slz-management-rg",
          classic_access: false,
          manual_address_prefix_management: false,
          default_network_acl_name: null,
          default_security_group_name: null,
          default_routing_table_name: null,
        },
        {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_vpc" "management_vpc" {
  name                        = "iac-management-vpc"
  resource_group              = ibm_resource_group.slz_management_rg.id
  default_network_acl_name    = null
  default_security_group_name = null
  default_routing_table_name  = null
  tags                        = ["hello","world"]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create vpc terraform with classic access and manual prefixes", () => {
      let actualData = formatVpc(
        {
          name: "management",
          resource_group: "slz-management-rg",
          classic_access: true,
          manual_address_prefix_management: true,
          default_network_acl_name: null,
          default_security_group_name: null,
          default_routing_table_name: null,
        },
        {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_vpc" "management_vpc" {
  name                        = "iac-management-vpc"
  resource_group              = ibm_resource_group.slz_management_rg.id
  default_network_acl_name    = null
  default_security_group_name = null
  default_routing_table_name  = null
  tags                        = ["hello","world"]
  classic_access              = true
  address_prefix_management   = "manual"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatAddressPrefix", () => {
    it("should create terraform for vpc address prefix", () => {
      let actualData = formatAddressPrefix(
        {
          name: "vsi-subnet-1",
          zone: 1,
          cidr: "1.2.3.4/5",
          vpc: "management",
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
        }
      );
      let expectedData = `
resource "ibm_is_vpc_address_prefix" "management_vsi_subnet_1_prefix" {
  name = "iac-management-vsi-subnet-1"
  vpc  = ibm_is_vpc.management_vpc.id
  zone = "us-south-1"
  cidr = "1.2.3.4/5"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatSubnet", () => {
    it("should create subnet", () => {
      let actualData = formatSubnet(
        {
          vpc: "management",
          name: "vsi-subnet-1",
          resource_group: "slz-management-rg",
          cidr: "1.2.3.4/5",
          network_acl: "management",
          public_gateway: true,
          has_prefix: true,
          zone: 1,
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_subnet" "management_vsi_subnet_1" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "iac-management-vsi-subnet-1"
  zone            = "us-south-1"
  resource_group  = ibm_resource_group.slz_management_rg.id
  tags            = ["hello","world"]
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_subnet_1_prefix.cidr
  public_gateway  = ibm_is_public_gateway.management_gateway_zone_1.id
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create subnet with a string value prefix and no pgw", () => {
      let actualData = formatSubnet(
        {
          vpc: "management",
          name: "vsi-subnet-1",
          resource_group: "slz-management-rg",
          cidr: "1.2.3.4/5",
          network_acl: "management",
          public_gateway: false,
          has_prefix: false,
          zone: 1,
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_subnet" "management_vsi_subnet_1" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "iac-management-vsi-subnet-1"
  zone            = "us-south-1"
  resource_group  = ibm_resource_group.slz_management_rg.id
  tags            = ["hello","world"]
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = "1.2.3.4/5"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatAcl", () => {
    it("should format network acl", () => {
      let actualData = formatAcl(
        {
          name: "management",
          resource_group: "slz-management-rg",
          vpc: "management",
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_network_acl" "management_management_acl" {
  name           = "iac-management-management-acl"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = ibm_resource_group.slz_management_rg.id
  tags           = ["hello","world"]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatAclRule", () => {
    it("should format network acl rule with no protocol", () => {
      let actualData = formatAclRule(
        {
          acl: "management",
          vpc: "management",
          action: "allow",
          destination: "10.0.0.0/8",
          direction: "inbound",
          name: "allow-ibm-inbound",
          source: "161.26.0.0/16",
          icmp: {
            type: null,
            code: null,
          },
          tcp: {
            port_min: null,
            port_max: null,
            source_port_min: null,
            source_port_max: null,
          },
          udp: {
            port_min: null,
            port_max: null,
            source_port_min: null,
            source_port_max: null,
          },
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_ibm_inbound" {
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-ibm-inbound"
  source      = "161.26.0.0/16"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should format network acl rule with tcp protocol", () => {
      let actualData = formatAclRule(
        {
          acl: "management",
          vpc: "management",
          action: "allow",
          destination: "10.0.0.0/8",
          direction: "inbound",
          name: "allow-ibm-inbound-8080",
          source: "161.26.0.0/16",
          icmp: {
            type: null,
            code: null,
          },
          tcp: {
            port_min: 8080,
            port_max: null,
            source_port_min: null,
            source_port_max: null,
          },
          udp: {
            port_min: null,
            port_max: null,
            source_port_min: null,
            source_port_max: null,
          },
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_ibm_inbound_8080" {
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-ibm-inbound-8080"
  source      = "161.26.0.0/16"

  tcp {
    port_min        = 8080
    port_max        = null
    source_port_min = null
    source_port_max = null
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should format network acl rule with udp protocol", () => {
      let actualData = formatAclRule(
        {
          acl: "management",
          vpc: "management",
          action: "allow",
          destination: "10.0.0.0/8",
          direction: "inbound",
          name: "allow-ibm-inbound-8080",
          source: "161.26.0.0/16",
          icmp: {
            type: null,
            code: null,
          },
          udp: {
            port_min: 8080,
            port_max: null,
            source_port_min: null,
            source_port_max: null,
          },
          tcp: {
            port_min: null,
            port_max: null,
            source_port_min: null,
            source_port_max: null,
          },
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_ibm_inbound_8080" {
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-ibm-inbound-8080"
  source      = "161.26.0.0/16"

  udp {
    port_min        = 8080
    port_max        = null
    source_port_min = null
    source_port_max = null
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should format network acl rule with icmp protocol", () => {
      let actualData = formatAclRule(
        {
          acl: "management",
          vpc: "management",
          action: "allow",
          destination: "10.0.0.0/8",
          direction: "inbound",
          name: "allow-ibm-inbound-8080",
          source: "161.26.0.0/16",
          icmp: {
            type: 1,
            code: 2,
          },
          udp: {
            port_min: null,
            port_max: null,
            source_port_min: null,
            source_port_max: null,
          },
          tcp: {
            port_min: null,
            port_max: null,
            source_port_min: null,
            source_port_max: null,
          },
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_ibm_inbound_8080" {
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-ibm-inbound-8080"
  source      = "161.26.0.0/16"

  icmp {
    type = 1
    code = 2
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
  describe("formatPgw", () => {
    it("should format a public gateway", () => {
      let actualData = formatPgw(
        {
          resource_group: "slz-management-rg",
          vpc: "management",
          zone: 1,
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_public_gateway" "management_gateway_zone_1" {
  name           = "iac-management-gateway-zone-1"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = ibm_resource_group.slz_management_rg.id
  zone           = "us-south-1"
  tags           = ["hello","world"]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should format a public gateway with an overriden name", () => {
      let actualData = formatPgw(
        {
          override_name: "override-gw",
          resource_group: "slz-management-rg",
          vpc: "management",
          zone: 1,
        },
        {
          _options: {
            region: "us-south",
            prefix: "iac",
            tags: ["hello", "world"],
          },
          resource_groups: [
            {
              use_data: false,
              name: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData = `
resource "ibm_is_public_gateway" "management_override_gw" {
  name           = "iac-management-override-gw"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = ibm_resource_group.slz_management_rg.id
  zone           = "us-south-1"
  tags           = ["hello","world"]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("vpcTf", () => {
    it("should create vpc terraform", () => {
      let actualData = vpcTf({
        _options: {
          region: "us-south",
          tags: ["hello", "world"],
          prefix: "iac",
        },
        resource_groups: [
          {
            use_data: false,
            name: "slz-management-rg",
          },
        ],
        vpcs: [
          {
            name: "management",
            resource_group: "slz-management-rg",
            classic_access: false,
            manual_address_prefix_management: true,
            default_network_acl_name: null,
            default_security_group_name: null,
            default_routing_table_name: null,
            address_prefixes: [
              {
                name: "vsi-subnet-1",
                zone: 1,
                cidr: "1.2.3.4/5",
                vpc: "management",
              },
            ],
            subnets: [
              {
                vpc: "management",
                name: "vsi-subnet-1",
                resource_group: "slz-management-rg",
                cidr: "1.2.3.4/5",
                network_acl: "management",
                public_gateway: true,
                has_prefix: true,
                zone: 1,
              },
            ],
            acls: [
              {
                name: "management",
                resource_group: "slz-management-rg",
                vpc: "management",
                rules: [
                  {
                    acl: "management",
                    vpc: "management",
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                ],
              },
            ],
            public_gateways: [
              {
                resource_group: "slz-management-rg",
                vpc: "management",
                zone: 1,
              },
            ],
          },
        ],
      });
      let expectedData = `##############################################################################
# Management VPC
##############################################################################

resource "ibm_is_vpc" "management_vpc" {
  name                        = "iac-management-vpc"
  resource_group              = ibm_resource_group.slz_management_rg.id
  default_network_acl_name    = null
  default_security_group_name = null
  default_routing_table_name  = null
  tags                        = ["hello","world"]
  address_prefix_management   = "manual"
}

resource "ibm_is_vpc_address_prefix" "management_vsi_subnet_1_prefix" {
  name = "iac-management-vsi-subnet-1"
  vpc  = ibm_is_vpc.management_vpc.id
  zone = "us-south-1"
  cidr = "1.2.3.4/5"
}

resource "ibm_is_network_acl" "management_management_acl" {
  name           = "iac-management-management-acl"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = ibm_resource_group.slz_management_rg.id
  tags           = ["hello","world"]
}

resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_ibm_inbound" {
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-ibm-inbound"
  source      = "161.26.0.0/16"
}

resource "ibm_is_public_gateway" "management_gateway_zone_1" {
  name           = "iac-management-gateway-zone-1"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = ibm_resource_group.slz_management_rg.id
  zone           = "us-south-1"
  tags           = ["hello","world"]
}

resource "ibm_is_subnet" "management_vsi_subnet_1" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "iac-management-vsi-subnet-1"
  zone            = "us-south-1"
  resource_group  = ibm_resource_group.slz_management_rg.id
  tags            = ["hello","world"]
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_subnet_1_prefix.cidr
  public_gateway  = ibm_is_public_gateway.management_gateway_zone_1.id
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should create vpc terraform with multiple vpcs", () => {
      let actualData = vpcTf({
        _options: {
          region: "us-south",
          tags: ["hello", "world"],
          prefix: "iac",
        },
        resource_groups: [
          {
            use_data: false,
            name: "slz-management-rg",
          },
        ],
        vpcs: [
          {
            name: "management",
            resource_group: "slz-management-rg",
            classic_access: false,
            manual_address_prefix_management: true,
            default_network_acl_name: null,
            default_security_group_name: null,
            default_routing_table_name: null,
            address_prefixes: [
              {
                name: "vsi-subnet-1",
                zone: 1,
                cidr: "1.2.3.4/5",
                vpc: "management",
              },
            ],
            subnets: [
              {
                vpc: "management",
                name: "vsi-subnet-1",
                resource_group: "slz-management-rg",
                cidr: "1.2.3.4/5",
                network_acl: "management",
                public_gateway: true,
                has_prefix: true,
                zone: 1,
              },
            ],
            acls: [
              {
                name: "management",
                resource_group: "slz-management-rg",
                vpc: "management",
                rules: [
                  {
                    acl: "management",
                    vpc: "management",
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                ],
              },
            ],
            public_gateways: [
              {
                resource_group: "slz-management-rg",
                vpc: "management",
                zone: 1,
              },
            ],
          },
          {
            name: "workload",
            resource_group: "slz-management-rg",
            classic_access: false,
            manual_address_prefix_management: true,
            default_network_acl_name: null,
            default_security_group_name: null,
            default_routing_table_name: null,
            address_prefixes: [
              {
                name: "vsi-subnet-1",
                zone: 1,
                cidr: "1.2.3.4/5",
                vpc: "management",
              },
            ],
            subnets: [
              {
                vpc: "management",
                name: "vsi-subnet-1",
                resource_group: "slz-management-rg",
                ipv4_cidr_block: "1.2.3.4/5",
                network_acl: "management",
                public_gateway: true,
                has_prefix: true,
                zone: 1,
              },
            ],
            acls: [
              {
                name: "management",
                resource_group: "slz-management-rg",
                vpc: "management",
                rules: [
                  {
                    acl: "management",
                    vpc: "management",
                    action: "allow",
                    destination: "10.0.0.0/8",
                    direction: "inbound",
                    name: "allow-ibm-inbound",
                    source: "161.26.0.0/16",
                    icmp: {
                      type: null,
                      code: null,
                    },
                    tcp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                    udp: {
                      port_min: null,
                      port_max: null,
                      source_port_min: null,
                      source_port_max: null,
                    },
                  },
                ],
              },
            ],
            public_gateways: [
              {
                resource_group: "slz-management-rg",
                vpc: "management",
                zone: 1,
              },
            ],
          },
        ],
      });
      let expectedData = `##############################################################################
# Management VPC
##############################################################################

resource "ibm_is_vpc" "management_vpc" {
  name                        = "iac-management-vpc"
  resource_group              = ibm_resource_group.slz_management_rg.id
  default_network_acl_name    = null
  default_security_group_name = null
  default_routing_table_name  = null
  tags                        = ["hello","world"]
  address_prefix_management   = "manual"
}

resource "ibm_is_vpc_address_prefix" "management_vsi_subnet_1_prefix" {
  name = "iac-management-vsi-subnet-1"
  vpc  = ibm_is_vpc.management_vpc.id
  zone = "us-south-1"
  cidr = "1.2.3.4/5"
}

resource "ibm_is_network_acl" "management_management_acl" {
  name           = "iac-management-management-acl"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = ibm_resource_group.slz_management_rg.id
  tags           = ["hello","world"]
}

resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_ibm_inbound" {
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-ibm-inbound"
  source      = "161.26.0.0/16"
}

resource "ibm_is_public_gateway" "management_gateway_zone_1" {
  name           = "iac-management-gateway-zone-1"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = ibm_resource_group.slz_management_rg.id
  zone           = "us-south-1"
  tags           = ["hello","world"]
}

resource "ibm_is_subnet" "management_vsi_subnet_1" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "iac-management-vsi-subnet-1"
  zone            = "us-south-1"
  resource_group  = ibm_resource_group.slz_management_rg.id
  tags            = ["hello","world"]
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_subnet_1_prefix.cidr
  public_gateway  = ibm_is_public_gateway.management_gateway_zone_1.id
}

##############################################################################

##############################################################################
# Workload VPC
##############################################################################

resource "ibm_is_vpc" "workload_vpc" {
  name                        = "iac-workload-vpc"
  resource_group              = ibm_resource_group.slz_management_rg.id
  default_network_acl_name    = null
  default_security_group_name = null
  default_routing_table_name  = null
  tags                        = ["hello","world"]
  address_prefix_management   = "manual"
}

resource "ibm_is_vpc_address_prefix" "management_vsi_subnet_1_prefix" {
  name = "iac-management-vsi-subnet-1"
  vpc  = ibm_is_vpc.management_vpc.id
  zone = "us-south-1"
  cidr = "1.2.3.4/5"
}

resource "ibm_is_network_acl" "management_management_acl" {
  name           = "iac-management-management-acl"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = ibm_resource_group.slz_management_rg.id
  tags           = ["hello","world"]
}

resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_ibm_inbound" {
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-ibm-inbound"
  source      = "161.26.0.0/16"
}

resource "ibm_is_public_gateway" "management_gateway_zone_1" {
  name           = "iac-management-gateway-zone-1"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = ibm_resource_group.slz_management_rg.id
  zone           = "us-south-1"
  tags           = ["hello","world"]
}

resource "ibm_is_subnet" "management_vsi_subnet_1" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "iac-management-vsi-subnet-1"
  zone            = "us-south-1"
  resource_group  = ibm_resource_group.slz_management_rg.id
  tags            = ["hello","world"]
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_subnet_1_prefix.cidr
  public_gateway  = ibm_is_public_gateway.management_gateway_zone_1.id
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
});
