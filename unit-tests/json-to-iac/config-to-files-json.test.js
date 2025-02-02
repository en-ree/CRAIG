const { assert } = require("chai");
let slzNetwork = { ...require("../data-files/slz-network.json") };
const slzNetworkFiles = require("../data-files/config-to-files/modules-slz-network-files.json");
const f5Network = require("../data-files/f5-nw.json");
const f5NetworkFiles = require("../data-files/f5-nw-files.json");
const {
  configToFilesJson,
} = require("../../client/src/lib/json-to-iac/config-to-files-json");
const { transpose } = require("lazy-z");
const powerNw = require("../data-files/config-to-files/modules-power-config.json");
const powerNwFiles = require("../data-files/config-to-files/modules-power-config-to-files.json");

describe("configToFilesJson", () => {
  describe("files", () => {
    it("should return correct main.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["main.tf"],
        slzNetworkFiles["main.tf"],
        "it should return correct data"
      );
    });
    it("should return correct flow_logs.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["flow_logs.tf"],
        slzNetworkFiles["flow_logs.tf"],
        "it should return correct data"
      );
    });
    it("should return correct clusters.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["clusters.tf"],
        slzNetworkFiles["clusters.tf"],
        "it should create file"
      );
    });
    it("should return correct transit_gateways.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["transit_gateways.tf"],
        slzNetworkFiles["transit_gateways.tf"],
        "it should create file"
      );
    });
    it("should return correct transit_gateways.tf", () => {
      let nw = { ...slzNetwork };
      nw.transit_gateways = [];
      let actualData = configToFilesJson(nw);
      assert.deepEqual(
        actualData["transit_gateways.tf"],
        null,
        "it should be null"
      );
    });
    it("should return correct vpn_gateways.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["vpn_gateways.tf"],
        slzNetworkFiles["vpn_gateways.tf"],
        "it should create file"
      );
    });
    it("should return correct vpn_gateways.tf", () => {
      let nw = { ...slzNetwork };
      nw.vpn_gateways = [];
      let actualData = configToFilesJson(nw);
      assert.deepEqual(
        actualData["vpn_gateways.tf"],
        null,
        "it should be null"
      );
    });
    it("should return correct vpn_gateways.tf", () => {
      let nw = { ...slzNetwork };
      nw.vsi = [];
      let actualData = configToFilesJson(nw);
      assert.deepEqual(
        actualData["virtual_servers.tf"],
        null,
        "it should be null"
      );
    });
    it("should return correct craig.json", () => {
      slzNetwork.clusters[0].opaque_secrets = [];
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["craig.json"],
        slzNetworkFiles["craig.json"],
        "it should create file"
      );
    });
    it("should return correct vpn_servers.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["vpn_servers.tf"],
        slzNetworkFiles["vpn_servers.tf"],
        "it should create file"
      );
    });
    it("should return correct vpn_servers.tf with empty vpn_servers", () => {
      let nw = { ...slzNetwork };
      nw.vpn_servers = [];
      let actualData = configToFilesJson(nw);
      assert.deepEqual(actualData["vpn_servers.tf"], null, "it should be null");
    });
    it("should return correct vpn_servers.tf with empty vpn_servers routes", () => {
      let nw = { ...slzNetwork };
      nw.vpn_servers[0]["routes"] = [];
      let actualData = configToFilesJson(nw);

      assert.deepEqual(
        actualData["vpn_servers.tf"],
        slzNetworkFiles["vpn_servers_no_route.tf"],
        "it should be null"
      );
    });
    it("should return correct virtual_private_endpoints.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["virtual_private_endpoints.tf"],
        slzNetworkFiles["virtual_private_endpoints.tf"],
        "it should create file"
      );
    });
    it("should return correct versions.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["versions.tf"],
        slzNetworkFiles["versions.tf"],
        "it should create file"
      );
    });
    it("should return correct secrets_manager.tf", () => {
      let secretsManagerNw = { ...slzNetwork };
      secretsManagerNw.secrets_manager = [
        {
          name: "secrets-manager",
          resource_group: "slz-service-rg",
          kms: "slz-kms",
          encryption_key: "slz-slz-key",
        },
      ];
      let actualData = configToFilesJson(secretsManagerNw);
      assert.deepEqual(
        actualData["secrets_manager.tf"],
        '##############################################################################\n# Key Management Authorizations\n##############################################################################\n\nresource "ibm_iam_authorization_policy" "secrets_manager_to_slz_kms_kms_policy" {\n  source_service_name         = "secrets-manager"\n  description                 = "Allow Secets Manager instance to read from KMS instance"\n  target_service_name         = "kms"\n  target_resource_instance_id = ibm_resource_instance.slz_kms.guid\n  roles = [\n    "Reader"\n  ]\n}\n\n##############################################################################\n\n##############################################################################\n# Secrets Manager Instances\n##############################################################################\n\nresource "ibm_resource_instance" "secrets_manager_secrets_manager" {\n  name              = "${var.prefix}-secrets-manager"\n  location          = var.region\n  plan              = "standard"\n  service           = "secrets-manager"\n  resource_group_id = ibm_resource_group.slz_service_rg.id\n  parameters = {\n    kms_key = ibm_kms_key.slz_kms_slz_slz_key_key.crn\n  }\n  timeouts {\n    create = "1h"\n    delete = "1h"\n  }\n  tags = [\n    "slz",\n    "landing-zone"\n  ]\n  depends_on = [\n    ibm_iam_authorization_policy.secrets_manager_to_slz_kms_kms_policy\n  ]\n}\n\n##############################################################################\n',
        "it should create file"
      );
    });
    it("should add variable for imported certificated", () => {
      let secretsManagerNw = { ...slzNetwork };
      secretsManagerNw.secrets_manager = [
        {
          name: "secrets-manager",
          resource_group: "slz-service-rg",
          kms: "slz-kms",
          encryption_key: "slz-slz-key",
          secrets: [
            {
              name: "imported-cert",
              secrets_manager: "secrets-manager",
              credentials: "cos-bind-key",
              credential_instance: "cos",
              credential_type: "cos",
              description: "Credentials for COS instance",
              type: "imported",
            },
            {
              name: "cos-secret",
              secrets_manager: "secrets-manager",
              credentials: "cos-bind-key",
              credential_instance: "cos",
              credential_type: "cos",
              description: "Credentials for COS instance",
              type: "kv",
            },
          ],
        },
      ];
      let actualData = configToFilesJson(secretsManagerNw);
      assert.deepEqual(
        actualData["variables.tf"],
        `##############################################################################
# Variables
##############################################################################

variable "ibmcloud_api_key" {
  description = "The IBM Cloud platform API key needed to deploy IAM enabled resources."
  type        = string
  sensitive   = true
}

variable "region" {
  description = "IBM Cloud Region where resources will be provisioned"
  type        = string
  default     = "us-south"
  validation {
    error_message = "Region must be in a supported IBM VPC region."
    condition     = contains(["us-south", "us-east", "br-sao", "ca-tor", "eu-gb", "eu-de", "jp-tok", "jp-osa", "au-syd"], var.region)
  }
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
  validation {
    error_message = "Prefix must begin with a lowercase letter and contain only lowercase letters, numbers, and - characters. Prefixes must end with a lowercase letter or number and be 16 or fewer characters."
    condition     = can(regex("^([a-z]|[a-z][-a-z0-9]*[a-z0-9])", var.prefix)) && length(var.prefix) <= 16
  }
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  default     = "public-key"
  validation {
    error_message = "Public SSH Key must be a valid ssh rsa public key."
    condition     = "\${var.slz_ssh_key_public_key == null || can(regex("ssh-rsa AAAA[0-9A-Za-z+/]+[=]{0,3} ?([^@]+@[^@]+)?", var.slz_ssh_key_public_key))}"
  }
}

variable "secrets_manager_imported_cert_data" {
  description = "PEM encoded contents of your imported certificate"
  type        = string
  sensitive   = true
}

##############################################################################
`,
        "it should return correct variables"
      );
    });
    it("should return correct secrets_manager.tf when no instances present", () => {
      let noSecretsManagerNw = { ...slzNetwork };
      noSecretsManagerNw.secrets_manager = [];
      let actualData = configToFilesJson(noSecretsManagerNw);
      assert.deepEqual(
        actualData["secrets_manager.tf"],
        null,
        "it should create file"
      );
    });
    it("should return correct object_storage.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["object_storage.tf"],
        slzNetworkFiles["object_storage.tf"],
        "it should create file"
      );
    });
    it("should return correct key_management.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["key_management.tf"],
        slzNetworkFiles["key_management.tf"],
        "it should create file"
      );
    });
    it("should return correct resource_groups.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["resource_groups.tf"],
        slzNetworkFiles["resource_groups.tf"],
        "it should create file"
      );
    });
    it("should return correct ssh_keys.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["ssh_keys.tf"],
        slzNetworkFiles["ssh_keys.tf"],
        "it should create file"
      );
    });
    it("should return correct variables.tf when no ssh keys are present", () => {
      let noSshNw = { ...slzNetwork };
      noSshNw.ssh_keys = [];
      let actualData = configToFilesJson(noSshNw);
      assert.deepEqual(
        actualData["variables.tf"],
        slzNetworkFiles["variables.tf"].replace(/variable\s"slz_ssh[^#]+/, ""),
        "it should create file"
      );
    });
    it("should return correct variables.tf without ssh key variable when it's using data", () => {
      let dataSshNw = { ...slzNetwork };
      dataSshNw.ssh_keys = [
        {
          name: "slz-ssh-key",
          use_data: true,
        },
      ];
      let actualData = configToFilesJson(dataSshNw);
      assert.deepEqual(
        actualData["variables.tf"],
        slzNetworkFiles["variables.tf"].replace(/variable\s"slz_ssh[^#]+/, ""),
        "it should create file without ssh key variable"
      );
    });
    it("should return correct appid.tf", () => {
      let nw = { ...slzNetwork };
      nw.appid = [
        {
          name: "test-appid",
          use_data: false,
          resource_group: "slz-service-rg",
          keys: [
            {
              appid: "test-appid",
              name: "test-key",
            },
            {
              appid: "test-appid",
              name: "test-key-2",
            },
          ],
        },
      ];
      let actualData = configToFilesJson(nw);
      assert.deepEqual(
        actualData["appid.tf"],
        slzNetworkFiles["appid.tf"],
        "it should create file"
      );
    });
    it("should return correct scc.tf", () => {
      let nw = { ...slzNetwork };
      nw.scc = {
        enable: true,
        credential_description: "scc posture credential description",
        id: "scc_group_id",
        passphrase: "scc_group_passphrase",
        name: "scc-posture-credential",
        location: "us",
        collector_description: "scc collector",
        is_public: true,
        scope_description: "scc scope",
      };
      let actualData = configToFilesJson(nw);
      assert.deepEqual(
        actualData["scc.tf"],
        slzNetworkFiles["scc.tf"],
        "it should create file"
      );
    });
    it("should return correct event_streams.tf", () => {
      let nw = { ...slzNetwork };
      nw.event_streams = [
        {
          name: "event-streams",
          plan: "enterprise-3nodes-2tb",
          resource_group: "slz-service-rg",
          private_ip_allowlist: ["10.0.0.0/32", "10.0.0.1/32"],
          throughput: "150MB/s",
          storage_size: "2TB",
        },
      ];
      let actualData = configToFilesJson(nw);
      assert.deepEqual(
        actualData["event_streams.tf"],
        slzNetworkFiles["event_streams.tf"],
        "it should create file"
      );
    });
    it("should return correct observability.tf", () => {
      let nw = { ...slzNetwork };
      transpose(
        {
          logdna: {
            enabled: true,
            plan: "lite",
            platform_logs: true,
            resource_group: "service-rg",
            role: "Manager",
            bucket: "atracker",
            cos: "cos",
            bucket_endpoint: "private",
            archive: true,
          },
          sysdig: {
            enabled: true,
            plan: "lite",
            resource_group: "service-rg",
            platform_logs: true,
          },
          atracker: {
            enabled: true,
            name: "atracker",
            type: "cos",
            target_name: "cos",
            bucket: "atracker",
            cos_key: "atracker-cos-key",
            plan: "lite",
            resource_group: "service-rg",
            archive: true,
            instance: true,
          },
        },
        nw
      );
      let actualData = configToFilesJson(nw);
      assert.deepEqual(
        actualData["observability.tf"],
        `##############################################################################
# Atracker Instance
##############################################################################

resource "ibm_resource_instance" "atracker" {
  name              = "\${var.prefix}-\${var.region}-atracker"
  resource_group_id = ibm_resource_group.service_rg.id
  service           = "logdnaat"
  plan              = "lite"
  location          = var.region
  service_endpoints = "private"
  tags = [
    "slz",
    "landing-zone"
  ]
}

resource "ibm_resource_key" "atracker_key" {
  name                 = "\${var.prefix}-\${var.region}-atracker-key"
  resource_instance_id = ibm_resource_instance.atracker.id
  role                 = "Manager"
  tags = [
    "slz",
    "landing-zone"
  ]
}

##############################################################################

##############################################################################
# LogDNA Instance
##############################################################################

resource "ibm_resource_instance" "logdna" {
  name              = "\${var.prefix}-logdna"
  resource_group_id = ibm_resource_group.service_rg.id
  service           = "logdna"
  plan              = "lite"
  location          = var.region
  service_endpoints = "private"
  tags = [
    "slz",
    "landing-zone"
  ]
  parameters = {
    default_receiver = true
  }
}

resource "ibm_resource_key" "logdna_key" {
  name                 = "\${var.prefix}-logdna-key"
  resource_instance_id = ibm_resource_instance.logdna.id
  role                 = "Manager"
  tags = [
    "slz",
    "landing-zone"
  ]
}

##############################################################################

##############################################################################
# LogDNA Resources
##############################################################################

provider "logdna" {
  alias      = "logdna"
  servicekey = ibm_resource_key.logdna_key.credentials["service_key"]
  url        = "https://api.\${var.region}.logging.cloud.ibm.com"
}

resource "logdna_archive" "logdna_archive" {
  provider    = logdna.logdna
  integration = "ibm"
  ibm_config {
    apikey             = var.ibmcloud_api_key
    bucket             = ibm_cos_bucket.cos_object_storage_atracker_bucket.bucket_name
    endpoint           = ibm_cos_bucket.cos_object_storage_atracker_bucket.s3_endpoint_private
    resourceinstanceid = ibm_resource_instance.cos_object_storage.id
  }
}

provider "logdna" {
  alias      = "atracker"
  servicekey = ibm_resource_key.atracker_key.credentials["service_key"]
  url        = "https://api.\${var.region}.logging.cloud.ibm.com"
}

resource "logdna_archive" "atracker_archive" {
  provider    = logdna.atracker
  integration = "ibm"
  ibm_config {
    apikey             = var.ibmcloud_api_key
    bucket             = ibm_cos_bucket.cos_object_storage_atracker_bucket.bucket_name
    endpoint           = ibm_cos_bucket.cos_object_storage_atracker_bucket.s3_endpoint_private
    resourceinstanceid = ibm_resource_instance.cos_object_storage.id
  }
}

##############################################################################

##############################################################################
# Sysdig Instance
##############################################################################

resource "ibm_resource_instance" "sysdig" {
  name              = "\${var.prefix}-sysdig"
  resource_group_id = ibm_resource_group.service_rg.id
  service           = "sysdig-monitor"
  plan              = "lite"
  location          = var.region
  service_endpoints = "private"
  tags = [
    "slz",
    "landing-zone"
  ]
  parameters = {
    default_receiver = true
  }
}

resource "ibm_resource_key" "sysdig_key" {
  name                 = "\${var.prefix}-sysdig-key"
  resource_instance_id = ibm_resource_instance.sysdig.id
  role                 = "Manager"
  tags = [
    "slz",
    "landing-zone"
  ]
}

##############################################################################
`,
        "it should return corer"
      );
      assert.deepEqual(
        actualData["versions.tf"],
        `##############################################################################
# Terraform Providers
##############################################################################

terraform {
  required_providers {
    ibm = {
      source  = "IBM-Cloud/ibm"
      version = "~>1.56.1"
    }
    logdna = {
      source                = "logdna/logdna"
      version               = ">= 1.14.2"
      configuration_aliases = [logdna.logdna, logdna.atracker]
    }
  }
  required_version = ">=1.3"
}

##############################################################################
`,
        "it should return data"
      );
    });
    it("should return correct versions.tf with logdna archive but no atracker archive", () => {
      let nw = { ...slzNetwork };
      transpose(
        {
          logdna: {
            enabled: true,
            plan: "lite",
            platform_logs: true,
            resource_group: "service-rg",
            role: "Manager",
            bucket: "atracker",
            cos: "cos",
            bucket_endpoint: "private",
            archive: true,
          },
          sysdig: {
            enabled: true,
            plan: "lite",
            resource_group: "service-rg",
            platform_logs: true,
          },
          atracker: {
            enabled: true,
            name: "atracker",
            type: "cos",
            target_name: "cos",
            bucket: "atracker",
            cos_key: "atracker-cos-key",
            plan: "lite",
            resource_group: "service-rg",
            archive: false,
            instance: true,
          },
        },
        nw
      );
      let actualData = configToFilesJson(nw);
      assert.deepEqual(
        actualData["versions.tf"],
        `##############################################################################
# Terraform Providers
##############################################################################

terraform {
  required_providers {
    ibm = {
      source  = "IBM-Cloud/ibm"
      version = "~>1.56.1"
    }
    logdna = {
      source                = "logdna/logdna"
      version               = ">= 1.14.2"
      configuration_aliases = [logdna.logdna]
    }
  }
  required_version = ">=1.3"
}

##############################################################################
`,
        "it should return data"
      );
    });
    it("should return correct load_balancers.tf", () => {
      let nw = { ...slzNetwork };
      nw.load_balancers = [
        {
          name: "lb-1",
          vpc: "management",
          type: "public",
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          vsi_per_subnet: 2,
          security_groups: ["management-vpe-sg"],
          resource_group: "slz-management-rg",
          algorithm: "round_robin",
          protocol: "tcp",
          health_delay: 60,
          health_retries: 5,
          health_timeout: 30,
          health_type: "https",
          proxy_protocol: "v1",
          session_persistence_type: "app_cookie",
          session_persistence_app_cookie_name: "cookie1",
          port: 80,
          target_vsi: ["management-server"],
          listener_port: 443,
          listener_protocol: "https",
          connection_limit: 2,
        },
      ];
      let actualData = configToFilesJson(nw);
      assert.deepEqual(
        actualData["load_balancers.tf"],
        slzNetworkFiles["load_balancers.tf"],
        "it should create file"
      );
    });
    it("should return correct dns.tf", () => {
      let nw = { ...slzNetwork };
      nw.dns = [
        {
          name: "test",
          plan: "standard-dns",
          resource_group: "service-rg",
          zones: [
            {
              name: "test.com",
              instance: "test",
              description: "test description",
              label: "test",
              vpcs: ["management"],
            },
          ],
          records: [
            {
              instance: "test",
              dns_zone: "test.com",
              type: "A",
              name: "testA",
              rdata: "test.com",
            },
            {
              instance: "test",
              dns_zone: "fake-zone", // pretend zone for unit test coverage
              type: "A",
              name: "testA",
              rdata: "test.com",
            },
          ],
          custom_resolvers: [
            {
              name: "dev-res",
              instance: "test",
              description: "new resolve",
              high_availability: true,
              enabled: true,
              vpc: "management",
              subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            },
          ],
        },
      ];
      let actualData = configToFilesJson(nw);
      assert.deepEqual(
        actualData["dns.tf"],
        slzNetworkFiles["dns.tf"],
        "it should create file"
      );
    });
    it("should return correct cbr.tf", () => {
      let nw = { ...slzNetwork };
      nw.cbr_zones = [
        {
          name: "foo-cbr-name",
          account_id: "12ab34cd56ef78ab90cd12ef34ab56cd",
          description: "this is a cbr zone description",
          addresses: [
            {
              account_id: "12ab34cd56ef78ab90cd12ef34ab56cd",
              type: "ipAddress",
              value: "169.23.56.234",
              location: "us-south",
              service_instance: "fake-service-instance",
              service_name: "frog-service-name",
              service_type: "frog-service",
            },
            {
              account_id: "12ab34cd56ef78ab90cd12ef34ab56cd",
              type: "ipRange",
              value: "169.23.22.0-169.23.22.255",
              location: "us-south",
              service_instance: "fake-service-instance",
              service_name: "frog-service-name",
              service_type: "frog-service",
            },
          ],
          exclusions: [
            {
              type: "ipAddress",
              value: "169.23.22.11",
            },
            {
              type: "ipAddress",
              value: "169.23.22.10",
            },
          ],
        },
      ];
      nw.cbr_rules = [
        {
          name: "frog",
          description: "test cbr rule description",
          enforcement_mode: "enabled",
          api_type_id: "api_type_id",
          contexts: [
            {
              name: "networkZoneId",
              value:
                "559052eb8f43302824e7ae490c0281eb, bf823d4f45b64ceaa4671bee0479346e",
            },
            {
              name: "endpointType",
              value: "private",
            },
          ],
          resource_attributes: [
            {
              name: "accountId",
              value: "12ab34cd56ef78ab90cd12ef34ab56cd",
            },
            {
              name: "serviceName",
              value: "network-policy-enabled",
            },
          ],
          tags: [
            {
              name: "tag_name",
              value: "tag_value",
            },
          ],
        },
      ];
      let actualData = configToFilesJson(nw);
      assert.deepEqual(
        actualData["cbr.tf"],
        slzNetworkFiles["cbr.tf"],
        "it should create file"
      );
    });
    it("should return correct icd.tf when no instances present", () => {
      let noIcdServices = { ...slzNetwork };
      noIcdServices.icd = [];
      let actualData = configToFilesJson(noIcdServices);
      assert.deepEqual(
        actualData["icd.tf"],
        null,
        "it should not create icd file"
      );
    });
    it("should return correct icd.tf", () => {
      let icdServices = { ...slzNetwork };
      icdServices.icd = [
        {
          kms: "kms",
          use_data: true,
          encryption_key: "slz-vsi-volume-key",
          resource_group: "slz-service-rg",
          name: "icd-psql",
          service: "databases-for-postgresql",
          group_id: "member",
          memory: 1024,
          disk: 1024,
          cpu: 0,
        },
      ];
      let actualData = configToFilesJson(icdServices);
      assert.deepEqual(
        actualData["icd.tf"],
        `##############################################################################
# Database Services
##############################################################################

data "ibm_resource_instance" "icd_psql" {
  name              = "icd-psql"
  resource_group_id = ibm_resource_group.slz_service_rg.id
  service           = "databases-for-postgresql"
}

##############################################################################
`,
        "it should create file"
      );
    });
  });
  describe("vpc module", () => {
    it("should return correct management vpc main", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData.management_vpc["main.tf"],
        slzNetworkFiles.management_vpc["main.tf"],
        "it should return correct data"
      );
    });
    it("should return correct management vpc variables", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData.management_vpc["variables.tf"],
        slzNetworkFiles.management_vpc["variables.tf"],
        "it should return correct data"
      );
    });
    it("should return correct management vpc outputs", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData.management_vpc["outputs.tf"],
        slzNetworkFiles.management_vpc["outputs.tf"],
        "it should return correct data"
      );
    });
    it("should return correct management acl", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData.management_vpc["acl_management_management.tf"],
        slzNetworkFiles.management_vpc["acl_management_management.tf"],
        "it should return correct data"
      );
    });
    it("should return correct management sg", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData.management_vpc["sg_management_vpe_sg.tf"],
        slzNetworkFiles.management_vpc["sg_management_vpe_sg.tf"],
        "it should return correct data"
      );
    });
    it("should return correct management rg", () => {
      let cloneNetwork = { ...slzNetwork };
      cloneNetwork.routing_tables = [
        {
          vpc: "management",
          name: "routing-table",
          route_direct_link_ingress: true,
          transit_gateway_ingress: true,
          route_vpc_zone_ingress: true,
          routes: [
            {
              vpc: "management",
              routing_table: "routing-table",
              name: "test-route",
              zone: 1,
              destination: "1.2.3.4/5",
              action: "delegate",
            },
          ],
        },
      ];
      let actualData = configToFilesJson(cloneNetwork);
      assert.deepEqual(
        actualData.management_vpc["rt_routing_table.tf"],
        slzNetworkFiles.management_vpc["rt_routing_table.tf"],
        "it should return correct data"
      );
    });
    it("should return correct versions", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData.management_vpc["versions.tf"],
        slzNetworkFiles.management_vpc["versions.tf"],
        "it should return correct data"
      );
    });
    describe("edge vpc module cases", () => {
      it("should return correct management vpc main when using public gateways", () => {
        let nw = { ...slzNetwork };
        let pgwNw = {};
        transpose(nw, pgwNw);
        pgwNw.vpcs[0].public_gateways = [
          {
            vpc: "management",
            zone: 1,
          },
          {
            vpc: "management",
            zone: 2,
          },
          {
            vpc: "management",
            zone: 3,
          },
        ];
        let actualData = configToFilesJson(pgwNw);
        assert.deepEqual(
          actualData.management_vpc["main.tf"],
          '##############################################################################\n# Management VPC\n##############################################################################\n\nresource "ibm_is_vpc" "management_vpc" {\n  name                        = "${var.prefix}-management-vpc"\n  resource_group              = var.slz_management_rg_id\n  tags                        = var.tags\n  address_prefix_management   = "manual"\n  default_network_acl_name    = null\n  default_security_group_name = null\n  default_routing_table_name  = null\n}\n\nresource "ibm_is_vpc_address_prefix" "management_vsi_zone_1_prefix" {\n  name = "${var.prefix}-management-vsi-zone-1"\n  vpc  = ibm_is_vpc.management_vpc.id\n  zone = "${var.region}-1"\n  cidr = "10.10.10.0/24"\n}\n\nresource "ibm_is_vpc_address_prefix" "management_vsi_zone_2_prefix" {\n  name = "${var.prefix}-management-vsi-zone-2"\n  vpc  = ibm_is_vpc.management_vpc.id\n  zone = "${var.region}-2"\n  cidr = "10.10.20.0/24"\n}\n\nresource "ibm_is_vpc_address_prefix" "management_vsi_zone_3_prefix" {\n  name = "${var.prefix}-management-vsi-zone-3"\n  vpc  = ibm_is_vpc.management_vpc.id\n  zone = "${var.region}-3"\n  cidr = "10.10.30.0/24"\n}\n\nresource "ibm_is_vpc_address_prefix" "management_vpe_zone_1_prefix" {\n  name = "${var.prefix}-management-vpe-zone-1"\n  vpc  = ibm_is_vpc.management_vpc.id\n  zone = "${var.region}-1"\n  cidr = "10.20.10.0/24"\n}\n\nresource "ibm_is_vpc_address_prefix" "management_vpe_zone_2_prefix" {\n  name = "${var.prefix}-management-vpe-zone-2"\n  vpc  = ibm_is_vpc.management_vpc.id\n  zone = "${var.region}-2"\n  cidr = "10.20.20.0/24"\n}\n\nresource "ibm_is_vpc_address_prefix" "management_vpe_zone_3_prefix" {\n  name = "${var.prefix}-management-vpe-zone-3"\n  vpc  = ibm_is_vpc.management_vpc.id\n  zone = "${var.region}-3"\n  cidr = "10.20.30.0/24"\n}\n\nresource "ibm_is_vpc_address_prefix" "management_vpn_zone_1_prefix" {\n  name = "${var.prefix}-management-vpn-zone-1"\n  vpc  = ibm_is_vpc.management_vpc.id\n  zone = "${var.region}-1"\n  cidr = "10.30.10.0/24"\n}\n\nresource "ibm_is_public_gateway" "management_gateway_zone_1" {\n  name           = "${var.prefix}-management-gateway-zone-1"\n  vpc            = ibm_is_vpc.management_vpc.id\n  resource_group = var._id\n  zone           = "${var.region}-1"\n  tags           = var.tags\n}\n\nresource "ibm_is_public_gateway" "management_gateway_zone_2" {\n  name           = "${var.prefix}-management-gateway-zone-2"\n  vpc            = ibm_is_vpc.management_vpc.id\n  resource_group = var._id\n  zone           = "${var.region}-2"\n  tags           = var.tags\n}\n\nresource "ibm_is_public_gateway" "management_gateway_zone_3" {\n  name           = "${var.prefix}-management-gateway-zone-3"\n  vpc            = ibm_is_vpc.management_vpc.id\n  resource_group = var._id\n  zone           = "${var.region}-3"\n  tags           = var.tags\n}\n\nresource "ibm_is_subnet" "management_vsi_zone_1" {\n  vpc             = ibm_is_vpc.management_vpc.id\n  name            = "${var.prefix}-management-vsi-zone-1"\n  zone            = "${var.region}-1"\n  resource_group  = var.slz_management_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.management_management_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_zone_1_prefix.cidr\n}\n\nresource "ibm_is_subnet" "management_vpn_zone_1" {\n  vpc             = ibm_is_vpc.management_vpc.id\n  name            = "${var.prefix}-management-vpn-zone-1"\n  zone            = "${var.region}-1"\n  resource_group  = var.slz_management_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.management_management_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vpn_zone_1_prefix.cidr\n}\n\nresource "ibm_is_subnet" "management_vsi_zone_2" {\n  vpc             = ibm_is_vpc.management_vpc.id\n  name            = "${var.prefix}-management-vsi-zone-2"\n  zone            = "${var.region}-2"\n  resource_group  = var.slz_management_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.management_management_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_zone_2_prefix.cidr\n}\n\nresource "ibm_is_subnet" "management_vsi_zone_3" {\n  vpc             = ibm_is_vpc.management_vpc.id\n  name            = "${var.prefix}-management-vsi-zone-3"\n  zone            = "${var.region}-3"\n  resource_group  = var.slz_management_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.management_management_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_zone_3_prefix.cidr\n}\n\nresource "ibm_is_subnet" "management_vpe_zone_1" {\n  vpc             = ibm_is_vpc.management_vpc.id\n  name            = "${var.prefix}-management-vpe-zone-1"\n  zone            = "${var.region}-1"\n  resource_group  = var.slz_management_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.management_management_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vpe_zone_1_prefix.cidr\n}\n\nresource "ibm_is_subnet" "management_vpe_zone_2" {\n  vpc             = ibm_is_vpc.management_vpc.id\n  name            = "${var.prefix}-management-vpe-zone-2"\n  zone            = "${var.region}-2"\n  resource_group  = var.slz_management_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.management_management_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vpe_zone_2_prefix.cidr\n}\n\nresource "ibm_is_subnet" "management_vpe_zone_3" {\n  vpc             = ibm_is_vpc.management_vpc.id\n  name            = "${var.prefix}-management-vpe-zone-3"\n  zone            = "${var.region}-3"\n  resource_group  = var.slz_management_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.management_management_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vpe_zone_3_prefix.cidr\n}\n\n##############################################################################\n',
          "it should return correct data"
        );
      });
      it("should return correct management vpc variables when subnets are in more than one resource group", () => {
        let nw = { ...slzNetwork };
        let subnetNw = {};
        transpose(nw, subnetNw);
        subnetNw.vpcs[0].subnets[0].resource_group = "edge";
        let actualData = configToFilesJson({ ...subnetNw });
        assert.deepEqual(
          actualData.management_vpc["variables.tf"],
          `##############################################################################
# Management VPC Variables
##############################################################################

variable "tags" {
  description = "List of tags"
  type        = list(string)
}

variable "region" {
  description = "IBM Cloud Region where resources will be provisioned"
  type        = string
  validation {
    error_message = "Region must be in a supported IBM VPC region."
    condition     = contains(["us-south", "us-east", "br-sao", "ca-tor", "eu-gb", "eu-de", "jp-tok", "jp-osa", "au-syd"], var.region)
  }
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  validation {
    error_message = "Prefix must begin with a lowercase letter and contain only lowercase letters, numbers, and - characters. Prefixes must end with a lowercase letter or number and be 16 or fewer characters."
    condition     = can(regex("^([a-z]|[a-z][-a-z0-9]*[a-z0-9])", var.prefix)) && length(var.prefix) <= 16
  }
}

variable "slz_management_rg_id" {
  description = "ID for the resource group slz-management-rg"
  type        = string
}

variable "edge_id" {
  description = "ID for the resource group edge"
  type        = string
}

##############################################################################
`,
          "it should return correct data"
        );
      });
    });
  });
  describe("f5-nw", () => {
    let actualData = configToFilesJson(f5Network);
    it("should return correct f5_big_ip.tf", () => {
      assert.deepEqual(
        actualData["f5_big_ip.tf"],
        f5NetworkFiles["f5_big_ip.tf"],
        "it should create file"
      );
    });
    it("should return correct f5_user_data.yaml", () => {
      assert.deepEqual(
        actualData["f5_user_data.yaml"],
        f5NetworkFiles["f5_user_data.yaml"],
        "it should create file"
      );
    });
    it("should add tmos admin password variable", () => {
      let variables = `##############################################################################
# Variables
##############################################################################

variable "ibmcloud_api_key" {
  description = "The IBM Cloud platform API key needed to deploy IAM enabled resources."
  type        = string
  sensitive   = true
}

variable "region" {
  description = "IBM Cloud Region where resources will be provisioned"
  type        = string
  default     = "us-south"
  validation {
    error_message = "Region must be in a supported IBM VPC region."
    condition     = contains(["us-south", "us-east", "br-sao", "ca-tor", "eu-gb", "eu-de", "jp-tok", "jp-osa", "au-syd"], var.region)
  }
}

variable "prefix" {
  description = "Name prefix that will be prepended to named resources"
  type        = string
  default     = "slz"
  validation {
    error_message = "Prefix must begin with a lowercase letter and contain only lowercase letters, numbers, and - characters. Prefixes must end with a lowercase letter or number and be 16 or fewer characters."
    condition     = can(regex("^([a-z]|[a-z][-a-z0-9]*[a-z0-9])", var.prefix)) && length(var.prefix) <= 16
  }
}

variable "account_id" {
  description = "IBM Account ID where resources will be provisioned"
  type        = string
  default     = ""
}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  default     = "public-key"
  validation {
    error_message = "Public SSH Key must be a valid ssh rsa public key."
    condition     = "\${var.slz_ssh_key_public_key == null || can(regex("ssh-rsa AAAA[0-9A-Za-z+/]+[=]{0,3} ?([^@]+@[^@]+)?", var.slz_ssh_key_public_key))}"
  }
}

variable "tmos_admin_password" {
  description = "F5 TMOS Admin Password"
  type        = string
  sensitive   = true
  default     = "Goodpassword1234!"
  validation {
    error_message = "Value for tmos_password must be at least 15 characters, contain one numeric, one uppercase, and one lowercase character."
    condition     = var.tmos_admin_password == null ? true : (length(var.tmos_admin_password) >= 15 && can(regex("[A-Z]", var.tmos_admin_password)) && can(regex("[a-z]", var.tmos_admin_password)) && can(regex("[0-9]", var.tmos_admin_password)))
  }
}

##############################################################################
`;
      assert.deepEqual(
        actualData["variables.tf"],
        variables,
        "it should create file"
      );
    });
  });
  it("should throw when error", () => {
    let task = () => configToFilesJson();
    assert.throws(
      task,
      "TypeError: Cannot read properties of undefined (reading 'f5_vsi'"
    );
  });
  describe("power vs", () => {
    it("should return power config when provided", () => {
      let actualData = configToFilesJson(powerNw);
      assert.deepEqual(
        actualData["power_infrastructure.tf"],
        powerNwFiles["power_infrastructure.tf"],
        "it should create file"
      );
    });
    it("should return power instances config when provided", () => {
      let actualData = configToFilesJson(powerNw);
      assert.deepEqual(
        actualData["power_instances.tf"],
        powerNwFiles["power_instances.tf"],
        "it should create file"
      );
    });
  });
  describe("other use cases", () => {
    it("should parse json when flow logs is disabled", () => {
      let task = () =>
        configToFilesJson({
          _options: {
            prefix: "pci",
            region: "us-east",
            tags: [],
            zones: 3,
            endpoints: "private",
            account_id: "",
            fs_cloud: false,
            dynamic_subnets: true,
            enable_power_vs: false,
            power_vs_zone: null,
          },
          access_groups: [],
          appid: [],
          atracker: {
            enabled: false,
            type: "cos",
            name: "atracker",
            target_name: "atracker-cos",
            bucket: null,
            add_route: true,
            cos_key: null,
            locations: ["global", "us-south"],
          },
          cbr_rules: [],
          cbr_zones: [],
          clusters: [
            {
              kms: "kms",
              cos: null,
              entitlement: "cloud_pak",
              kube_type: "iks",
              kube_version: "1.26.7",
              flavor: "cx2.4x8",
              name: "workload-cluster",
              resource_group: "workload-rg",
              encryption_key: "roks-key",
              subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
              update_all_workers: true,
              vpc: "workload",
              worker_pools: [],
              opaque_secrets: [],
              workers_per_subnet: 2,
              private_endpoint: true,
              cos_name: "",
            },
          ],
          dns: [],
          event_streams: [],
          f5_vsi: [],
          iam_account_settings: {
            enable: false,
            mfa: null,
            allowed_ip_addresses: null,
            include_history: false,
            if_match: null,
            max_sessions_per_identity: null,
            restrict_create_service_id: null,
            restrict_create_platform_apikey: null,
            session_expiration_in_seconds: null,
            session_invalidation_in_seconds: null,
          },
          icd: [],
          key_management: [
            {
              name: "kms",
              resource_group: "workload-rg",
              use_hs_crypto: false,
              authorize_vpc_reader_role: true,
              use_data: false,
              keys: [
                {
                  key_ring: "ring",
                  name: "key",
                  root_key: true,
                  force_delete: true,
                  endpoint: "public",
                  rotation: 1,
                  dual_auth_delete: false,
                },
                {
                  key_ring: "ring",
                  name: "atracker-key",
                  root_key: true,
                  force_delete: true,
                  endpoint: "public",
                  rotation: 1,
                  dual_auth_delete: false,
                },
                {
                  key_ring: "ring",
                  name: "vsi-volume-key",
                  root_key: true,
                  force_delete: true,
                  endpoint: "public",
                  rotation: 1,
                  dual_auth_delete: false,
                },
                {
                  key_ring: "ring",
                  name: "roks-key",
                  root_key: true,
                  force_delete: null,
                  endpoint: null,
                  rotation: 1,
                  dual_auth_delete: false,
                },
              ],
            },
          ],
          load_balancers: [],
          logdna: {
            enabled: false,
            plan: "lite",
            endpoints: "private",
            platform_logs: false,
            resource_group: null,
            cos: null,
            bucket: null,
          },
          object_storage: [],
          power: [],
          resource_groups: [
            { use_prefix: true, name: "workload-rg", use_data: false },
          ],
          routing_tables: [],
          scc: {
            credential_description: null,
            id: null,
            passphrase: null,
            name: "",
            location: "us",
            collector_description: null,
            is_public: false,
            scope_description: null,
            enable: false,
          },
          secrets_manager: [],
          security_groups: [
            {
              vpc: "workload",
              name: "workload-vpe",
              resource_group: "workload-rg",
              rules: [
                {
                  vpc: "workload",
                  sg: "workload-vpe",
                  direction: "inbound",
                  name: "allow-ibm-inbound",
                  source: "161.26.0.0/16",
                  tcp: { port_max: null, port_min: null },
                  udp: { port_max: null, port_min: null },
                  icmp: { type: null, code: null },
                },
                {
                  vpc: "workload",
                  sg: "workload-vpe",
                  direction: "inbound",
                  name: "allow-vpc-inbound",
                  source: "10.0.0.0/8",
                  tcp: { port_max: null, port_min: null },
                  udp: { port_max: null, port_min: null },
                  icmp: { type: null, code: null },
                },
                {
                  vpc: "workload",
                  sg: "workload-vpe",
                  direction: "outbound",
                  name: "allow-vpc-outbound",
                  source: "10.0.0.0/8",
                  tcp: { port_max: null, port_min: null },
                  udp: { port_max: null, port_min: null },
                  icmp: { type: null, code: null },
                },
                {
                  vpc: "workload",
                  sg: "workload-vpe",
                  direction: "outbound",
                  name: "allow-ibm-tcp-53-outbound",
                  source: "161.26.0.0/16",
                  tcp: { port_max: 53, port_min: 53 },
                  udp: { port_max: null, port_min: null },
                  icmp: { type: null, code: null },
                },
                {
                  vpc: "workload",
                  sg: "workload-vpe",
                  direction: "outbound",
                  name: "allow-ibm-tcp-80-outbound",
                  source: "161.26.0.0/16",
                  tcp: { port_max: 80, port_min: 80 },
                  udp: { port_max: null, port_min: null },
                  icmp: { type: null, code: null },
                },
                {
                  vpc: "workload",
                  sg: "workload-vpe",
                  direction: "outbound",
                  name: "allow-ibm-tcp-443-outbound",
                  source: "161.26.0.0/16",
                  tcp: { port_max: 443, port_min: 443 },
                  udp: { port_max: null, port_min: null },
                  icmp: { type: null, code: null },
                },
              ],
              show: false,
            },
            {
              resource_group: "workload-rg",
              rules: [
                {
                  name: "allow-all-outbound",
                  direction: "outbound",
                  icmp: { type: null, code: null },
                  tcp: { port_min: null, port_max: null },
                  udp: { port_min: null, port_max: null },
                  source: "0.0.0.0/0",
                  vpc: "workload",
                  sg: "workload-sg",
                },
              ],
              name: "workload-sg",
              vpc: "workload",
              show: false,
            },
          ],
          ssh_keys: [
            {
              name: "ssh-key",
              public_key:
                "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDCCaeaZJfY0zu3aJD3oCTa/Dmil6AWYdtl5hKs5I+jcglvupo0jWDCToc3XPoJJ+GXAGsclc18S7iWkUID3TmGZlmqFYQU6YiDAhbEW2+5ISpv+ev2ZL7a88CmhjdRlAklm5nfJ+D9tZ7lPmZAHyCnoU01wvQ7RbIZ6JLsOG4wCZdVIhCzHr8SnhHaca6sjp4VzHPbHgZi8HxMkGjTP2nRCeDAseMaG10TQNxKVfcijPYPblstnI7eXDcL1fcMXoo5rZJPiBWQl5HYYb67zZjYLGwElKWvoFIbxzn1TM102mAf6vi0oR7nbPdiSim513FZXzNPaHr1aqhdCOWFUjb9FHRVGJ7LzCmWd632Q6LcH92bXrp28fUwqlZ+PscC5b0rWHfhjGWI9FCgMDcfWjfFqSV/dJ6jLQRG2IYqsJaqB598u3JWzua3NKd+BoDWb1lfkqt/3ldVBgdjBtmKWBnnydF/gRaaKWysuD2YnAaoxFpaxPnHHLenIclHBWTK3wU= jtp@Johns-MacBook-Air.local",
              resource_group: "workload-rg",
              use_data: false,
            },
          ],
          sysdig: {
            enabled: false,
            plan: "graduated-tier",
            resource_group: null,
          },
          teleport_vsi: [],
          transit_gateways: [],
          virtual_private_endpoints: [],
          vpcs: [
            {
              cos: null,
              bucket: "$disabled",
              name: "workload",
              resource_group: "workload-rg",
              classic_access: false,
              manual_address_prefix_management: true,
              default_network_acl_name: null,
              default_security_group_name: null,
              default_routing_table_name: null,
              publicGateways: [1, 2, 3],
              address_prefixes: [
                {
                  vpc: "workload",
                  zone: 1,
                  name: "workload-zone-1",
                  cidr: "10.10.0.0/22",
                },
                {
                  vpc: "workload",
                  zone: 2,
                  name: "workload-zone-2",
                  cidr: "10.20.0.0/22",
                },
                {
                  vpc: "workload",
                  zone: 3,
                  name: "workload-zone-3",
                  cidr: "10.30.0.0/22",
                },
              ],
              subnets: [
                {
                  vpc: "workload",
                  zone: 1,
                  cidr: "10.10.0.0/28",
                  name: "vsi-zone-1",
                  network_acl: "workload",
                  resource_group: "management-rg",
                  public_gateway: false,
                  has_prefix: false,
                },
                {
                  vpc: "workload",
                  zone: 2,
                  cidr: "10.20.0.0/28",
                  name: "vsi-zone-2",
                  network_acl: "workload",
                  resource_group: "management-rg",
                  public_gateway: false,
                  has_prefix: false,
                },
                {
                  vpc: "workload",
                  zone: 3,
                  cidr: "10.30.0.0/28",
                  name: "vsi-zone-3",
                  network_acl: "workload",
                  resource_group: "management-rg",
                  public_gateway: false,
                  has_prefix: false,
                },
                {
                  vpc: "workload",
                  zone: 1,
                  cidr: "10.10.0.32/29",
                  name: "vpe-zone-1",
                  resource_group: "management-rg",
                  network_acl: "workload",
                  public_gateway: false,
                  has_prefix: false,
                },
                {
                  vpc: "workload",
                  zone: 2,
                  cidr: "10.20.0.32/29",
                  name: "vpe-zone-2",
                  network_acl: "workload",
                  resource_group: "management-rg",
                  public_gateway: false,
                  has_prefix: false,
                },
                {
                  vpc: "workload",
                  zone: 3,
                  cidr: "10.30.0.32/29",
                  name: "vpe-zone-3",
                  network_acl: "workload",
                  resource_group: "management-rg",
                  public_gateway: false,
                  has_prefix: false,
                },
              ],
              public_gateways: [
                { vpc: "workload", zone: 1, resource_group: "workload-rg" },
                { vpc: "workload", zone: 2, resource_group: "workload-rg" },
                { vpc: "workload", zone: 3, resource_group: "workload-rg" },
              ],
              acls: [
                {
                  resource_group: "management-rg",
                  name: "workload",
                  vpc: "workload",
                  rules: [
                    {
                      action: "allow",
                      destination: "10.0.0.0/8",
                      direction: "inbound",
                      name: "allow-all-inbound",
                      source: "0.0.0.0/0",
                      acl: "workload",
                      vpc: "workload",
                      icmp: { type: null, code: null },
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
                      source: "10.0.0.0/8",
                      direction: "outbound",
                      name: "allow-all-outbound",
                      destination: "0.0.0.0/0",
                      acl: "workload",
                      vpc: "workload",
                      icmp: { type: null, code: null },
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
          vpn_gateways: [],
          vpn_servers: [],
          vsi: [
            {
              kms: "kms",
              encryption_key: "vsi-volume-key",
              image: "ibm-ubuntu-22-04-3-minimal-amd64-1",
              profile: "bx2d-2x8",
              name: "bastion",
              security_groups: ["workload-sg"],
              ssh_keys: ["ssh-key"],
              subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
              vpc: "workload",
              vsi_per_subnet: 1,
              resource_group: "workload-rg",
              override_vsi_name: null,
              user_data: "",
              network_interfaces: [],
              volumes: [],
              image_name:
                "Ubuntu Linux 22.04 LTS Jammy Jellyfish Minimal Install (amd64) [ibm-ubuntu-22-04-3-minimal-amd64-1]",
              enable_floating_ip: true,
            },
          ],
        });
      assert.doesNotThrow(task, "it should not throw");
    });
    it("should not throw when empty project is used", () => {
      let overrideJson = require("../../client/src/lib/docs/templates/from-scratch.json");

      let task = () => {
        configToFilesJson(overrideJson);
      };
      assert.doesNotThrow(task, "it should not throw an error");
    });
  });
});
