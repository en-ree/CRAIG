const { assert } = require("chai");
const {
  codeMirrorVpcTf,
  codeMirrorAclTf,
  codeMirrorSubnetsTf,
  codeMirrorEventStreamsTf,
  codeMirrorFormatIamAccountSettingsTf,
} = require("../../client/src/lib/json-to-iac/page-template");

describe("page template", () => {
  describe("vpc", () => {
    describe("codeMirrorVpcTf", () => {
      it("should create vpc code mirror terraform with public gateway", () => {
        let testData = {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
          resource_groups: [
            {
              use_data: false,
              name: "management-rg",
            },
          ],
          vpcs: [
            {
              cos: "cos",
              bucket: "management-bucket",
              name: "management",
              resource_group: "management-rg",
              classic_access: false,
              manual_address_prefix_management: true,
              default_network_acl_name: null,
              default_security_group_name: null,
              default_routing_table_name: null,
              publicGateways: [1],
              public_gateways: [
                {
                  vpc: "management",
                  zone: 1,
                  resource_group: "management-rg",
                },
              ],
            },
          ],
        };
        let expectedData = `##############################################################################
# Management VPC
##############################################################################

resource "ibm_is_vpc" "management_vpc" {
  name                        = "iac-management-vpc"
  resource_group              = var.management_rg_id
  address_prefix_management   = "manual"
  default_network_acl_name    = null
  default_security_group_name = null
  default_routing_table_name  = null
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_public_gateway" "management_gateway_zone_1" {
  name           = "iac-management-gateway-zone-1"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = var.management_rg_id
  zone           = "us-south-1"
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################

##############################################################################
# Management Flow Logs
##############################################################################

resource "ibm_is_flow_log" "management_flow_log_collector" {
  name           = "iac-management-vpc-logs"
  target         = module.management_vpc.id
  active         = true
  storage_bucket = ibm_cos_bucket.cos_object_storage_management_bucket_bucket.bucket_name
  resource_group = ibm_resource_group.management_rg.id
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_iam_authorization_policy.flow_logs_to_cos_object_storage_policy
  ]
}

##############################################################################
`;
        assert.deepEqual(
          codeMirrorVpcTf(testData),
          expectedData,
          "it should return correct terraform"
        );
      });
      it("should create vpc code mirror terraform without public gateway", () => {
        let testData = {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
          resource_groups: [
            {
              use_data: false,
              name: "management-rg",
            },
          ],
          vpcs: [
            {
              cos: "cos",
              bucket: "management-bucket",
              name: "management",
              resource_group: "management-rg",
              classic_access: false,
              manual_address_prefix_management: true,
              default_network_acl_name: null,
              default_security_group_name: null,
              default_routing_table_name: null,
              publicGateways: [],
            },
          ],
        };
        let expectedData = `##############################################################################
# Management VPC
##############################################################################

resource "ibm_is_vpc" "management_vpc" {
  name                        = "iac-management-vpc"
  resource_group              = var.management_rg_id
  address_prefix_management   = "manual"
  default_network_acl_name    = null
  default_security_group_name = null
  default_routing_table_name  = null
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################

##############################################################################
# Management Flow Logs
##############################################################################

resource "ibm_is_flow_log" "management_flow_log_collector" {
  name           = "iac-management-vpc-logs"
  target         = module.management_vpc.id
  active         = true
  storage_bucket = ibm_cos_bucket.cos_object_storage_management_bucket_bucket.bucket_name
  resource_group = ibm_resource_group.management_rg.id
  tags = [
    "hello",
    "world"
  ]
  depends_on = [
    ibm_iam_authorization_policy.flow_logs_to_cos_object_storage_policy
  ]
}

##############################################################################
`;
        assert.deepEqual(
          codeMirrorVpcTf(testData),
          expectedData,
          "it should return correct terraform"
        );
      });
    });
    describe("codeMirrorAclTf", () => {
      it("should create vpc acl code mirror terraform", () => {
        let testData = {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
          resource_groups: [
            {
              use_data: false,
              name: "management-rg",
            },
          ],
          vpcs: [
            {
              cos: "cos",
              bucket: "management-bucket",
              name: "management",
              resource_group: "management-rg",
              classic_access: false,
              manual_address_prefix_management: true,
              default_network_acl_name: null,
              default_security_group_name: null,
              default_routing_table_name: null,
              publicGateways: [],
              acls: [
                {
                  resource_group: "management-rg",
                  name: "management",
                  vpc: "management",
                  rules: [
                    {
                      action: "allow",
                      destination: "10.0.0.0/8",
                      direction: "inbound",
                      name: "allow-ibm-inbound",
                      source: "161.26.0.0/16",
                      acl: "management",
                      vpc: "management",
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
                      action: "allow",
                      destination: "10.0.0.0/8",
                      direction: "inbound",
                      name: "allow-all-network-inbound",
                      source: "10.0.0.0/8",
                      acl: "management",
                      vpc: "management",
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
                      action: "allow",
                      destination: "0.0.0.0/0",
                      direction: "outbound",
                      name: "allow-all-outbound",
                      source: "0.0.0.0/0",
                      acl: "management",
                      vpc: "management",
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
            },
          ],
        };
        let expectedData = `##############################################################################
# Management VPC
##############################################################################

resource "ibm_is_network_acl" "management_management_acl" {
  name           = "iac-management-management-acl"
  vpc            = ibm_is_vpc.management_vpc.id
  resource_group = var.management_rg_id
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_ibm_inbound" {
  source      = "161.26.0.0/16"
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-ibm-inbound"
}

resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_all_network_inbound" {
  source      = "10.0.0.0/8"
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "10.0.0.0/8"
  direction   = "inbound"
  name        = "allow-all-network-inbound"
}

resource "ibm_is_network_acl_rule" "management_management_acl_rule_allow_all_outbound" {
  source      = "0.0.0.0/0"
  network_acl = ibm_is_network_acl.management_management_acl.id
  action      = "allow"
  destination = "0.0.0.0/0"
  direction   = "outbound"
  name        = "allow-all-outbound"
}

##############################################################################
`;
        assert.deepEqual(
          codeMirrorAclTf(testData),
          expectedData,
          "it should return correct terraform"
        );
      });
    });
    describe("codeMirrorSubnetsTf", () => {
      it("should create vpc subnets code mirror terraform", () => {
        let testData = {
          _options: {
            region: "us-south",
            tags: ["hello", "world"],
            prefix: "iac",
          },
          resource_groups: [
            {
              use_data: false,
              name: "management-rg",
            },
          ],
          vpcs: [
            {
              cos: "cos",
              bucket: "management-bucket",
              name: "management",
              resource_group: "management-rg",
              classic_access: false,
              manual_address_prefix_management: true,
              default_network_acl_name: null,
              default_security_group_name: null,
              default_routing_table_name: null,
              publicGateways: [],
              subnets: [
                {
                  vpc: "management",
                  zone: 1,
                  cidr: "10.10.10.0/24",
                  name: "vsi-zone-1",
                  network_acl: "management",
                  resource_group: "management-rg",
                  public_gateway: false,
                  has_prefix: true,
                },
                {
                  vpc: "management",
                  zone: 1,
                  cidr: "10.10.30.0/24",
                  name: "vpn-zone-1",
                  network_acl: "management",
                  resource_group: "management-rg",
                  public_gateway: false,
                  has_prefix: true,
                },
                {
                  vpc: "management",
                  zone: 2,
                  cidr: "10.20.10.0/24",
                  name: "vsi-zone-2",
                  network_acl: "management",
                  resource_group: "management-rg",
                  public_gateway: false,
                  has_prefix: true,
                },
                {
                  vpc: "management",
                  zone: 3,
                  cidr: "10.30.10.0/24",
                  name: "vsi-zone-3",
                  network_acl: "management",
                  resource_group: "management-rg",
                  public_gateway: false,
                  has_prefix: true,
                },
                {
                  vpc: "management",
                  zone: 1,
                  cidr: "10.10.20.0/24",
                  name: "vpe-zone-1",
                  resource_group: "management-rg",
                  network_acl: "management",
                  public_gateway: false,
                  has_prefix: true,
                },
                {
                  vpc: "management",
                  zone: 2,
                  cidr: "10.20.20.0/24",
                  name: "vpe-zone-2",
                  network_acl: "management",
                  resource_group: "management-rg",
                  public_gateway: false,
                  has_prefix: true,
                },
                {
                  vpc: "management",
                  zone: 3,
                  cidr: "10.30.20.0/24",
                  name: "vpe-zone-3",
                  network_acl: "management",
                  resource_group: "management-rg",
                  public_gateway: false,
                  has_prefix: true,
                },
              ],
            },
          ],
        };
        let expectedData = `##############################################################################
# Management VPC
##############################################################################

resource "ibm_is_subnet" "management_vsi_zone_1" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "iac-management-vsi-zone-1"
  zone            = "us-south-1"
  resource_group  = var.management_rg_id
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_zone_1_prefix.cidr
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_subnet" "management_vpn_zone_1" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "iac-management-vpn-zone-1"
  zone            = "us-south-1"
  resource_group  = var.management_rg_id
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vpn_zone_1_prefix.cidr
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_subnet" "management_vsi_zone_2" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "iac-management-vsi-zone-2"
  zone            = "us-south-2"
  resource_group  = var.management_rg_id
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_zone_2_prefix.cidr
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_subnet" "management_vsi_zone_3" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "iac-management-vsi-zone-3"
  zone            = "us-south-3"
  resource_group  = var.management_rg_id
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_zone_3_prefix.cidr
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_subnet" "management_vpe_zone_1" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "iac-management-vpe-zone-1"
  zone            = "us-south-1"
  resource_group  = var.management_rg_id
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vpe_zone_1_prefix.cidr
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_subnet" "management_vpe_zone_2" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "iac-management-vpe-zone-2"
  zone            = "us-south-2"
  resource_group  = var.management_rg_id
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vpe_zone_2_prefix.cidr
  tags = [
    "hello",
    "world"
  ]
}

resource "ibm_is_subnet" "management_vpe_zone_3" {
  vpc             = ibm_is_vpc.management_vpc.id
  name            = "iac-management-vpe-zone-3"
  zone            = "us-south-3"
  resource_group  = var.management_rg_id
  network_acl     = ibm_is_network_acl.management_management_acl.id
  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vpe_zone_3_prefix.cidr
  tags = [
    "hello",
    "world"
  ]
}

##############################################################################
`;
        assert.deepEqual(
          codeMirrorSubnetsTf(testData),
          expectedData,
          "it should return correct terraform"
        );
      });
    });
  });
  describe("codeMirrorEventStreamsTf", () => {
    it("should return empty string when event streams length is 0", () => {
      let testData = { event_streams: [] };
      let expectedData = ``;
      assert.deepEqual(
        codeMirrorEventStreamsTf(testData),
        expectedData,
        "it should return an empty string"
      );
    });
    it("should return event streams tf", () => {
      let testData = {
        _options: {
          tags: ["hello", "world"],
          prefix: "iac",
          region: "us-south",
        },
        resource_groups: [
          {
            use_prefix: true,
            name: "slz-service-rg",
            use_data: false,
          },
          {
            use_prefix: true,
            name: "slz-management-rg",
            use_data: false,
          },
          {
            use_prefix: true,
            name: "slz-workload-rg",
            use_data: false,
          },
        ],
        event_streams: [
          {
            name: "event-streams",
            plan: "enterprise",
            resource_group: "slz-service-rg",
            endpoints: "private",
            private_ip_allowlist: ["10.0.0.0/32", "10.0.0.1/32"],
            throughput: "150MB/s",
            storage_size: "2TB",
          },
        ],
      };
      let expectedData = `##############################################################################
# Event Streams
##############################################################################

resource "ibm_resource_instance" "event_streams_es" {
  name              = "iac-event-streams"
  service           = "messagehub"
  plan              = "enterprise"
  location          = "us-south"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  parameters = {
    service-endpoints    = "private"
    private_ip_allowlist = "[10.0.0.0/32,10.0.0.1/32]"
    throughput           = "150"
    storage_size         = "2048"
  }
  timeouts {
    create = "3h"
    update = "1h"
    delete = "1h"
  }
}

##############################################################################
`;
      assert.deepEqual(
        codeMirrorEventStreamsTf(testData),
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("codeMirrorFormatIamAccountSettingsTf", () => {
    it("should return correct terraform", () => {
      let testData = {
        iam_account_settings: {
          enable: true,
          mfa: "NONE",
          allowed_ip_addresses: "1.2.3.4,5.6.7.8",
          include_history: true,
          if_match: 2,
          max_sessions_per_identity: 2,
          restrict_create_service_id: "RESTRICTED",
          restrict_create_platform_apikey: "RESTRICTED",
          session_expiration_in_seconds: 900,
          session_invalidation_in_seconds: 900,
        }
      };
      let expectedData = `
resource "ibm_iam_account_settings" "iam_account_settings" {
  mfa                             = "NONE"
  allowed_ip_addresses            = "1.2.3.4,5.6.7.8"
  include_history                 = true
  if_match                        = 2
  max_sessions_per_identity       = 2
  restrict_create_service_id      = "RESTRICTED"
  restrict_create_platform_apikey = "RESTRICTED"
  session_expiration_in_seconds   = 900
  session_invalidation_in_seconds = 900
}
`;
      assert.deepEqual(
        codeMirrorFormatIamAccountSettingsTf(testData),
        expectedData,
        "should return iam account settings terraform"
      );
    });
  });
});
