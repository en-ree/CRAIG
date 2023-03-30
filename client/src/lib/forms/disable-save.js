const {
  isNullOrEmptyString,
  isEmpty,
  isIpv4CidrOrAddress,
  containsKeys,
  validPortRange
} = require("lazy-z");
const {
  invalidName,
  invalidEncryptionKeyRing,
  invalidSshPublicKey,
  invalidSubnetTierName,
  invalidSecurityGroupRuleName,
  invalidIpCommaList
} = require("./invalid-callbacks");

/**
 * check if a field is null or empty string, reduce unit test writing
 * @param {string} field
 * @param {Object} stateData
 * @returns {boolean} true if null or empty string
 */
function badField(field, stateData) {
  return isNullOrEmptyString(stateData[field]);
}

/**
 * reduct unit test writing check if any fields from list are null or empty string
 * @param {*} fields
 * @param {*} stateData
 * @returns {boolean} true if any null or empty string
 */
function fieldsAreBad(fields, stateData) {
  let hasBadFields = false;
  fields.forEach(field => {
    if (badField(field, stateData)) {
      hasBadFields = true;
    }
  });
  return hasBadFields;
}

/**
 * test if a rule has an invalid port
 * @param {*} rule
 * @param {boolean=} isSecurityGroup
 * @returns {boolean} true if port is invalid
 */
function invalidPort(rule, isSecurityGroup) {
  let hasInvalidPort = false;
  if (rule.ruleProtocol !== "all") {
    (rule.ruleProtocol === "icmp"
      ? ["type", "code"]
      : isSecurityGroup
      ? ["port_min", "port_max"]
      : ["port_min", "port_max", "source_port_min", "source_port_max"]
    ).forEach(type => {
      if (rule.rule[type] && !hasInvalidPort) {
        hasInvalidPort = !validPortRange(type, rule.rule[type]);
      }
    });
  }
  return hasInvalidPort;
}

/**
 * disable save
 * @param {string} field field name
 * @param {Object} stateData
 * @param {Object} componentProps
 * @returns {boolean} true if match
 */

function disableSave(field, stateData, componentProps) {
  if (field === "scc") {
    return (
      stateData.collector_description.match(/^[A-z][a-zA-Z0-9-\._,\s]*$/i) ===
        null ||
      stateData.scope_description.match(/^[A-z][a-zA-Z0-9-\._,\s]*$/i) === null
    );
  } else if (field === "atracker") {
    return (
      fieldsAreBad(["bucket", "cos_key"], stateData) ||
      isEmpty(stateData.locations)
    );
  } else if (field === "object_storage") {
    return (
      invalidName("object_storage")(stateData, componentProps) ||
      fieldsAreBad(["kms", "resource_group"], stateData)
    );
  } else if (field === "appid") {
    return (
      invalidName("appid")(stateData, componentProps) ||
      badField("resource_group", stateData)
    );
  } else if (field === "appid_key") {
    return invalidName("appid_keys")(stateData, componentProps);
  } else if (field === "buckets") {
    return (
      invalidName("buckets")(stateData, componentProps) ||
      badField("kms_key", stateData)
    );
  } else if (field === "cos_keys") {
    return invalidName("cos_keys")(stateData, componentProps);
  } else if (field === "encryption_keys") {
    return (
      invalidName("encryption_keys")(stateData, componentProps) ||
      invalidEncryptionKeyRing(stateData)
    );
  } else if (field === "key_management") {
    return (
      invalidName("key_management")(stateData, componentProps) ||
      badField("resource_group", stateData)
    );
  } else if (field === "secrets_manager") {
    return (
      invalidName("secrets_manager")(stateData, componentProps) ||
      fieldsAreBad(["encryption_key", "resource_group"], stateData)
    );
  } else if (field === "resource_groups") {
    return invalidName("resource_groups")(stateData, componentProps);
  } else if (field === "vpcs") {
    return (
      fieldsAreBad(["bucket", "resource_group"], stateData) ||
      invalidName("vpcs")("name", stateData, componentProps) ||
      invalidName("vpcs")(
        "default_network_acl_name",
        stateData,
        componentProps
      ) ||
      invalidName("vpcs")(
        "default_security_group_name",
        stateData,
        componentProps
      ) ||
      invalidName("vpcs")(
        "default_routing_table_name",
        stateData,
        componentProps
      )
    );
  } else if (field === "ssh_keys") {
    return (
      invalidName("ssh_keys")(stateData, componentProps) ||
      isNullOrEmptyString(stateData.resource_group) ||
      (stateData.use_data
        ? false // do not check invalid public key if using data, return false
        : invalidSshPublicKey(stateData, componentProps).invalid)
    );
  } else if (field === "transit_gateways") {
    return (
      invalidName("transit_gateways")(stateData, componentProps) ||
      isNullOrEmptyString(stateData.resource_group) ||
      isEmpty(stateData.connections)
    );
  } else if (field === "acls") {
    return (
      !containsKeys(stateData, "resource_group") ||
      badField("resource_group", stateData) ||
      invalidName("acls")(stateData, componentProps)
    );
  } else if (field === "acl_rules") {
    return (
      invalidName("acl_rules")(stateData, componentProps) ||
      !isIpv4CidrOrAddress(stateData.source) ||
      !isIpv4CidrOrAddress(stateData.destination) ||
      invalidPort(stateData)
    );
  } else if (field === "sg_rules") {
    return (
      invalidSecurityGroupRuleName(stateData, componentProps) ||
      !isIpv4CidrOrAddress(stateData.source) ||
      invalidPort(stateData)
    );
  } else if (field === "vpn_gateways") {
    return (
      invalidName("vpn_gateways")(stateData, componentProps) ||
      fieldsAreBad(["resource_group", "vpc", "subnet"], stateData)
    );
  } else if (field === "subnetTier") {
    return (
      invalidSubnetTierName(stateData, componentProps) ||
      badField("networkAcl", stateData)
    );
  } else if (field === "subnet") {
    return badField("network_acl", stateData);
  } else if (field === "iam_account_settings") {
    return (
      fieldsAreBad(
        [
          "mfa",
          "restrict_create_platform_apikey",
          "restrict_create_service_id",
          "max_sessions_per_identity"
        ],
        stateData
      ) || invalidIpCommaList(stateData.allowed_ip_addresses)
    );
  } else if (field === "security_groups") {
    return (
      invalidName("security_groups")(stateData, componentProps) ||
      fieldsAreBad(["resource_group", "vpc"], stateData)
    );
  } else if (field === "clusters") {
    if (stateData.kube_type === "openshift") {
      if (
        fieldsAreBad(["cos"], stateData) ||
        stateData.subnets.length * stateData.workers_per_subnet < 2
      )
        return true;
    }
    return (
      invalidName("clusters")(stateData, componentProps) ||
      fieldsAreBad(
        [
          "resource_group",
          "vpc",
          "subnets",
          "encryption_key",
          "flavor",
          "kube_version"
        ],
        stateData
      ) ||
      isEmpty(stateData.subnets)
    );
  } else if (field === "worker_pools") {
    return (
      invalidName("worker_pools")(stateData, componentProps) ||
      fieldsAreBad(["flavor"], stateData) ||
      !stateData.subnets ||
      isEmpty(stateData.subnets)
    );
  } else if (field === "event_streams") {
    if (stateData.plan !== "enterprise") {
      return (
        invalidName("event_streams")(stateData, componentProps) ||
        badField("resource_group", stateData)
      );
    } else {
      return (
        invalidName("event_streams")(stateData, componentProps) ||
        fieldsAreBad(
          ["resource_group", "endpoints", "throughput", "storage_size"],
          stateData
        ) ||
        invalidIpCommaList(stateData.private_ip_allowlist)
      );
    }
  } else return false;
}

module.exports = { disableSave, invalidPort };
