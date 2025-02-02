const {
  snakeCase,
  getObjectFromArray,
  distinct,
  splat,
  transpose,
  parseIntFromZone,
  contains,
  kebabCase,
  azsort,
} = require("lazy-z");
const {
  rgIdRef,
  tfRef,
  vpcRef,
  composedZone,
  encryptionKeyRef,
  kebabName,
  tfBlock,
  tfDone,
  jsonToTfPrint,
  cdktfRef,
} = require("./utils");
const { varDotPrefix } = require("../constants");

/**
 * format vsi
 * @param {Object} vsi
 * @param {string} vsi.kms
 * @param {string} vsi.encryption_key
 * @param {string} vsi.image
 * @param {string} vsi.profile
 * @param {string} vsi.name
 * @param {Array<string>} vsi.security_groups
 * @param {Array<string>} vsi.ssh_keys
 * @param {string} vsi.subnet
 * @param {string} vsi.vpc
 * @param {number} vsi.index
 * @param {string} vsi.resource_group
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.region
 * @param {string} config._options.prefix
 * @returns {Object} terraform formatted vsi
 */

function ibmIsInstance(vsi, config) {
  let zone = vsi.subnet.replace(/[^]+(?=\d$)/g, "");
  let vsiName = vsi.index
    ? `${varDotPrefix}-${snakeCase(vsi.vpc)}-${vsi.name}-vsi-zone-${zone}-${
        vsi.index
      }`
    : vsi.name;
  let allSgIds = [],
    allSshKeyIds = [],
    networkInterfaces = [];
  let data = {
    name: vsi.index
      ? `${vsi.vpc} vpc ${vsi.name} vsi ${zone} ${vsi.index}`
      : vsi.name,
  };
  let vsiData = {
    name: vsiName,
    image: contains(vsi.image, "local")
      ? vsi.image
      : tfRef("ibm_is_image", vsi.image, "id", true),
    profile: vsi.profile,
    resource_group: rgIdRef(vsi.resource_group, config),
    vpc: vpcRef(vsi.vpc, "id", true),
    zone: composedZone(zone),
    tags: config._options.tags,
    primary_network_interface: [
      {
        subnet: `\${module.${snakeCase(vsi.vpc)}_vpc.${snakeCase(
          vsi.subnet
        )}_id}`,
      },
    ],
    boot_volume: [
      {
        encryption: encryptionKeyRef(vsi.kms, vsi.encryption_key, "crn"),
      },
    ],
  };
  if (vsi.network_interfaces) {
    vsi.network_interfaces.forEach((intf) => {
      let nwInterface = {
        subnet: `\${module.${vsi.vpc}_vpc.${snakeCase(intf.subnet)}_id}`,
        allow_ip_spoofing: true,
        security_groups: [],
      };
      intf.security_groups.forEach((group) => {
        nwInterface["security_groups"].push(
          `\${module.${vsi.vpc}_vpc.${snakeCase(group)}_id}`
        );
      });
      networkInterfaces.push(nwInterface);
    });
    if (vsi.network_interfaces.length > 0)
      vsiData.network_interfaces = networkInterfaces;
  }
  // add security groups
  vsi.security_groups.forEach((group) => {
    allSgIds.push(`\${module.${vsi.vpc}_vpc.${snakeCase(group)}_id}`);
  });
  vsiData.primary_network_interface[0].security_groups = allSgIds;
  // add ssh keys
  vsi.ssh_keys.forEach((key) => {
    allSshKeyIds.push(
      tfRef(
        `ibm_is_ssh_key`,
        key,
        "id",
        getObjectFromArray(config.ssh_keys, "name", key)?.use_data
      )
    );
  });
  vsiData.keys = allSshKeyIds;
  if (vsi.user_data) {
    vsiData.user_data = vsi.user_data;
  }
  if (vsi.volumes) {
    vsiData.volumes = [];
    vsi.volumes.forEach((volume) => {
      vsiData.volumes.push(
        tfRef(
          "ibm_is_volume",
          `${vsi.vpc} vpc ${vsi.name} vsi ${zone} ${
            vsi.index ? vsi.index + " " : ""
          }${volume.name}`
        )
      );
    });
  }
  if (vsi.reserved_ip) {
    vsiData.primary_network_interface[0].primary_ip = [
      {
        reserved_ip: `\${ibm_is_subnet_reserved_ip.${snakeCase(
          data.name
        )}_reserved_ip.reserved_ip}`,
      },
    ];
  }
  data.data = vsiData;
  return data;
}

/**
 * format vsi volume
 * @param {Object} vsi
 * @param {Object} config
 * @returns {Array<object>} terraform formatted vsi
 */
function ibmIsVolume(vsi, config) {
  let volumes = [];
  let zone = vsi.subnet.replace(/[^]+(?=\d$)/g, "");
  if (vsi.volumes)
    vsi.volumes.forEach((volume) => {
      let data = {
        name: `${vsi.vpc} vpc ${vsi.name} vsi ${zone} ${
          vsi.index ? vsi.index + " " : ""
        }${volume.name}`,
        data: {
          name:
            (vsi.index
              ? `${varDotPrefix}-${snakeCase(vsi.vpc)}-${
                  vsi.name
                }-vsi-zone-${zone}-${vsi.index}`
              : vsi.name) +
            "-" +
            volume.name,
          profile: volume.profile,
          zone: composedZone(zone),
          iops: volume.iops,
          capacity: volume.capacity,
          encryption_key: encryptionKeyRef(
            vsi.kms,
            volume.encryption_key,
            "crn"
          ),
          tags: config._options.tags,
        },
      };
      volumes.push(data);
    });
  return volumes;
}

/**
 * format vsi
 * @param {Object} vsi
 * @param {Object} config
 * @returns {string} terraform formatted vsi
 */
function formatVsi(vsi, config) {
  let data = ibmIsInstance(vsi, config);
  let tf = "";
  if (vsi.reserved_ip) {
    tf += jsonToTfPrint(
      "resource",
      "ibm_is_subnet_reserved_ip",
      data.name + "_reserved_ip",
      {
        subnet: `\${module.${vsi.vpc}_vpc.${snakeCase(vsi.subnet)}_id}`,
        name: kebabCase(data.data.name + "-reserved-ip"),
        address: vsi.reserved_ip,
      }
    );
  }
  tf += jsonToTfPrint("resource", "ibm_is_instance", data.name, data.data);
  ibmIsVolume(vsi, config).forEach((volume) => {
    tf += jsonToTfPrint("resource", "ibm_is_volume", volume.name, volume.data);
  });
  return tf;
}

/**
 * format vsi image data block
 * @param {string} imageName
 * @returns {string} terraform formatted code
 */
function formatVsiImage(imageName) {
  return jsonToTfPrint("data", "ibm_is_image", imageName, {
    name: imageName,
  });
}

/**
 * format load balancer for vsi deployment
 * @param {Object} deployment
 * @param {string} deployment.name
 * @param {string} deployment.type can be public or private
 * @param {Array<string>} deployment.security_groups
 * @param {Array<string>} deployment.subnets
 * @param {Array<string>} deployment.target_vsi
 * @param {number} deployment.port pool member port
 * @param {Object} config
 * @returns {object} terraform formatted string
 */

function ibmIsLbPoolMembers(deployment, config) {
  let members = [];
  deployment.target_vsi.forEach((vsi) => {
    // fetch vsi
    let vsiDeployment = getObjectFromArray(config.vsi, "name", vsi);
    // for each subnet vsi
    for (let subnet = 0; subnet < vsiDeployment.subnets.length; subnet++) {
      // for each vsi per subnet
      for (let count = 0; count < vsiDeployment.vsi_per_subnet; count++) {
        let vsiAddress = `${deployment.vpc} vpc ${
          vsiDeployment.name
        } vsi ${parseIntFromZone(vsiDeployment.subnets[subnet])} ${count + 1}`;
        let poolMemberAddress = `${deployment.name} ${vsiDeployment.name} ${vsiAddress} pool member`;
        // save ref to add dependencies to listener

        members.push({
          name: poolMemberAddress,
          data: {
            port: deployment.port,
            lb: tfRef("ibm_is_lb", `${deployment.name} load balancer`),
            pool: tfRef(
              "ibm_is_lb_pool",
              `${deployment.name} load balancer pool`,
              "pool_id"
            ),
            target_address: tfRef(
              "ibm_is_instance",
              vsiAddress,
              "primary_network_interface.0.primary_ip.0.address"
            ),
          },
        });
      }
    }
  });
  return members;
}

/**
 * format load balancer for vsi deployment
 * @param {Object} deployment
 * @param {string} deployment.name
 * @param {number} deployment.listener_port
 * @param {string} deployment.listener_protocol  Enumeration type are http, tcp, https and udp. Network load balancer supports only tcp and udp protocol.
 * @param {number} deployment.connection_limit
 * @param {Array<object>} poolMemberData pool member data
 * @returns {object} terraform formatted string
 */

function ibmIsLbListener(deployment, poolMemberData, cdktf) {
  let data = {
    name: `${deployment.name} listener`,
    data: {
      lb: tfRef("ibm_is_lb", `${deployment.name} load balancer`),
      default_pool: tfRef(
        "ibm_is_lb_pool",
        `${deployment.name} load balancer pool`
      ),
      port: deployment.listener_port,
      protocol: deployment.listener_protocol,
      connection_limit: deployment.connection_limit,
      depends_on: [],
    },
  };
  poolMemberData.forEach((member) => {
    let ref = "ibm_is_lb_pool_member." + snakeCase(member.name);
    data.data.depends_on.push(
      cdktf ? ref : cdktfRef("ibm_is_lb_pool_member." + snakeCase(member.name))
    );
  });
  return data;
}

/**
 * format load balancer for vsi deployment
 * @param {Object} deployment
 * @param {string} deployment.name
 * @param {string} deployment.algorithm  Supported values are round_robin, weighted_round_robin, or least_connections
 * @param {string} deployment.protocol pool protocol Enumeration type: http, https, tcp, udp are supported.
 * @param {number} deployment.health_delay The health check interval in seconds. Interval must be greater than timeout value.
 * @param {number} deployment.health_retries The health check max retries.
 * @param {number} deployment.health_timeout The health check timeout in seconds.
 * @param {string} deployment.health_type  Enumeration type: http, https, tcp are supported.
 * @param {string} deployment.session_persistence_type the session persistence type, Enumeration type: source_ip, app_cookie, http_cookie
 * @param {string} deployment.session_persistence_app_cookie_name Session persistence app cookie name. This is applicable only to app_cookie type.
 * @returns {string} terraform formatted string
 */
function ibmIsLbPool(deployment) {
  let data = {
    name: `${deployment.name} load balancer pool`,
    data: {
      lb: tfRef("ibm_is_lb", `${deployment.name} load balancer`),
      name: kebabName([deployment.name, "lb", "pool"]),
      algorithm: deployment.algorithm,
      protocol: deployment.protocol,
      health_delay: deployment.health_delay,
      health_retries: deployment.health_retries,
      health_timeout: deployment.health_timeout,
      health_type: deployment.health_type,
      proxy_protocol: deployment.proxy_protocol,
      session_persistence_type: deployment.session_persistence_type,
      session_persistence_app_cookie_name:
        deployment.session_persistence_app_cookie_name,
    },
  };
  if (deployment.session_persistence_type !== "app_cookie") {
    delete data.data.session_persistence_app_cookie_name;
  }
  return data;
}

/**
 * format load balancer for vsi deployment
 * @param {Object} deployment
 * @param {string} deployment.name
 * @param {string} deployment.resource_group
 * @param {string} deployment.algorithm  Supported values are round_robin, weighted_round_robin, or least_connections
 * @param {Object} config
 * @returns {object} terraform formatted string
 */

function ibmIsLb(deployment, config) {
  let data = {
    data: {
      name: kebabName([deployment.name, "lb"]),
      type: deployment.type,
      resource_group: rgIdRef(deployment.resource_group, config),
      tags: config._options.tags,
      security_groups: [],
      subnets: [],
    },
    name: `${deployment.name} load balancer`,
  };
  deployment.security_groups.forEach((group) => {
    data.data.security_groups.push(
      `\${module.${deployment.vpc}_vpc.${snakeCase(group)}_id}`
    );
  });
  deployment.subnets.forEach((subnet) => {
    data.data.subnets.push(
      `\${module.${snakeCase(deployment.vpc)}_vpc.${snakeCase(subnet)}_id}`
    );
  });
  return data;
}

/**
 * format load balancer for vsi deployment
 * @param {Object} deployment
 * @param {Object} config
 * @returns {string} terraform formatted string
 */
function formatLoadBalancer(deployment, config) {
  let poolTf = "";
  let poolMemberData = ibmIsLbPoolMembers(deployment, config);
  poolMemberData.forEach((member) => {
    poolTf += jsonToTfPrint(
      "resource",
      "ibm_is_lb_pool_member",
      member.name,
      member.data
    );
  });
  let listenerData = ibmIsLbListener(deployment, poolMemberData);
  let poolData = ibmIsLbPool(deployment, config);
  let lbData = ibmIsLb(deployment, config);
  return (
    jsonToTfPrint("resource", "ibm_is_lb", lbData.name, lbData.data) +
    jsonToTfPrint("resource", "ibm_is_lb_pool", poolData.name, poolData.data) +
    poolTf +
    jsonToTfPrint(
      "resource",
      "ibm_is_lb_listener",
      listenerData.name,
      listenerData.data
    )
  );
}

/**
 * vsi terraform
 * @param {Object} config
 * @param {Array<Object>} config.vsi
 * @returns {string} terraform string
 */
function vsiTf(config) {
  let tf = "",
    imageTf = "",
    fipTf = "";
  let allImagesNames = distinct(splat(config.vsi, "image"));
  allImagesNames.forEach((name) => {
    imageTf += formatVsiImage(name);
  });
  tf += tfBlock("image data sources", imageTf) + "\n";
  config.vsi.forEach((deployment) => {
    let blockData = "";
    deployment.subnets.sort(azsort).forEach((subnet) => {
      for (let i = 0; i < deployment.vsi_per_subnet; i++) {
        let instance = {};
        transpose(deployment, instance);
        instance.subnet = subnet;
        instance.index = i + 1;
        if (deployment.reserved_ips) {
          instance.reserved_ip = // get address at same index as subnet followed by index of vsi
            deployment.reserved_ips[deployment.subnets.indexOf(subnet)][i];
        }
        blockData += formatVsi(instance, config);
        if (deployment.enable_floating_ip) {
          fipTf += formatFip(instance);
        }
      }
    });
    tf +=
      tfBlock(
        `${deployment.vpc} VPC ${deployment.name} deployment`,
        blockData
      ) + "\n";
  });
  fipTf === "" ? "" : (tf += tfBlock("optionally add floating IPs", fipTf));
  return tfDone(tf);
}

/**
 * vsi terraform
 * @param {Object} config
 * @param {Array<Object>} config.load_balancers
 * @returns {string} terraform string
 */
function lbTf(config) {
  let tf = "";
  config.load_balancers.forEach((lb) => {
    tf +=
      tfBlock(lb.name + " load balancer", formatLoadBalancer(lb, config)) +
      "\n";
  });
  return tfDone(tf);
}

/**
 *
 * @param {Object} vsi vsi instance data on a particular subnet
 * @returns {Object} returns object for creating terraform formatted string
 */
function ibmIsFip(vsi) {
  let zone = vsi.subnet.replace(/[^]+(?=\d$)/g, "");
  let fipName = `${snakeCase(vsi.vpc)}-vpc-${vsi.name}-vsi-${zone}-${
    vsi.index
  }-fip`;
  return {
    name: fipName,
    data: {
      name: `${varDotPrefix}-${fipName}`,
      target: tfRef(
        "ibm_is_instance",
        `${snakeCase(vsi.vpc)}-vpc-${vsi.name}-vsi-${zone}-${vsi.index}`,
        "primary_network_interface.0.id"
      ),
    },
  };
}

/**
 *
 * @param {Object} instance vsi data on a particular subnet
 * @returns terraform formatted string
 */
function formatFip(instance) {
  let fipData = ibmIsFip(instance);
  return jsonToTfPrint(
    "resource",
    "ibm_is_floating_ip",
    fipData.name,
    fipData.data
  );
}

module.exports = {
  formatVsi,
  formatVsiImage,
  formatLoadBalancer,
  formatFip,
  vsiTf,
  lbTf,
  ibmIsLbPoolMembers,
  ibmIsLbListener,
  ibmIsLbPool,
  ibmIsInstance,
  ibmIsLb,
  ibmIsVolume,
  ibmIsFip,
};
