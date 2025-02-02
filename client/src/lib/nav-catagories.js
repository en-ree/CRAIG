const {
  resourceGroupTf,
  kmsTf,
  cosTf,
  secretsManagerTf,
  loggingMonitoringTf,
  atrackerTf,
  codeMirrorEventStreamsTf,
  appidTf,
  codeMirrorVpcTf,
  codeMirrorAclTf,
  codeMirrorSubnetsTf,
  routingTableTf,
  tgwTf,
  sgTf,
  vpeTf,
  vpnTf,
  clusterTf,
  sshKeyTf,
  vsiTf,
  lbTf,
  sccTf,
  dnsTf,
  f5Tf,
  iamTf,
  codeMirrorFormatIamAccountSettingsTf,
  cbrTf,
  vpnServerTf,
  icdTf,
  powerVsTf,
  powerVsVolumeTf,
} = require("./json-to-iac");
const { powerInstanceTf } = require("./json-to-iac/power-vs-instances");

const navCatagories = [
  {
    name: "Resource Groups",
    links: [
      {
        title: "Resource Groups",
        path: "/form/resourceGroups",
        react_icon: "GroupResource",
        toTf: resourceGroupTf,
        jsonField: "resource_groups",
        required: true,
      },
    ],
  },
  {
    name: "Services",
    links: [
      {
        title: "Key Management",
        path: "/form/keyManagement",
        react_icon: "IbmCloudKeyProtect",
        field: "key_management",
        toTf: kmsTf,
        required: true,
        jsonField: "key_management",
      },
      {
        title: "Object Storage",
        path: "/form/objectStorage",
        react_icon: "ObjectStorage",
        field: "cos",
        toTf: cosTf,
        required: true,
        jsonField: "object_storage",
      },
      {
        title: "Secrets Manager",
        path: "/form/secretsManager",
        react_icon: "IbmCloudSecretsManager",
        jsonField: "secrets_manager",
        toTf: secretsManagerTf,
      },
      {
        title: "Observability",
        path: "/form/observability",
        react_icon: "IbmCloudSysdigSecure",
        toTf: loggingMonitoringTf,
      },
      {
        title: "Activity Tracker",
        path: "/form/activityTracker",
        react_icon: "CloudAuditing",
        jsonField: "atracker",
        toTf: atrackerTf,
        required: true,
      },
      {
        title: "Event Streams",
        path: "/form/eventStreams",
        react_icon: "IbmCloudEventStreams",
        jsonField: "event_streams",
        toTf: codeMirrorEventStreamsTf,
      },
      {
        title: "App ID",
        path: "/form/appID",
        react_icon: "CloudApp",
        toTf: appidTf,
        jsonField: "appid",
      },
      {
        title: "Cloud Databases",
        path: "/form/icd",
        react_icon: "IbmDb2",
        toTf: icdTf,
        jsonField: "icd",
      },
    ],
  },
  {
    name: "Network",
    links: [
      {
        title: "Virtual Private Clouds",
        path: "/form/vpcs",
        react_icon: "VirtualPrivateCloud",
        toTf: codeMirrorVpcTf,
        jsonField: "vpcs",
        required: true,
      },
      {
        title: "VPC Access Control",
        path: "/form/nacls",
        react_icon: "SubnetAclRules",
        toTf: codeMirrorAclTf,
        required: true,
      },
      {
        title: "VPC Subnets",
        path: "/form/subnets",
        react_icon: "IbmCloudSubnets",
        toTf: codeMirrorSubnetsTf,
        required: true,
      },
      {
        title: "Routing Tables",
        path: "/form/routingTables",
        react_icon: "Router",
        toTf: routingTableTf,
        jsonField: "routing_tables",
      },
      {
        title: "Transit Gateways",
        path: "/form/transitGateways",
        react_icon: "IbmCloudTransitGateway",
        toTf: tgwTf,
        jsonField: "transit_gateways",
      },
      {
        title: "Security Groups",
        path: "/form/securityGroups",
        react_icon: "Security",
        toTf: sgTf,
        required: true,
        jsonField: "security_groups",
      },
      {
        title: "Virtual Private Endpoints",
        path: "/form/vpe",
        react_icon: "IbmCloudVpcEndpoints",
        toTf: vpeTf,
        jsonField: "virtual_private_endpoints",
        required: true,
      },
      {
        title: "VPN Gateways",
        path: "/form/vpn",
        react_icon: "GatewayVpn",
        toTf: vpnTf,
        jsonField: "vpn_gateways",
      },
    ],
  },
  {
    name: "Clusters",
    links: [
      {
        title: "Clusters",
        path: "/form/clusters",
        react_icon: "IbmCloudKubernetesService",
        toTf: clusterTf,
        required: true,
        jsonField: "clusters",
      },
    ],
  },
  {
    name: "Virtual Servers",
    links: [
      {
        title: "SSH Keys",
        path: "/form/sshKeys",
        react_icon: "Password",
        toTf: sshKeyTf,
        jsonField: "ssh_keys",
      },
      {
        title: "Virtual Server Instances",
        path: "/form/vsi",
        react_icon: "BareMetalServer_02",
        toTf: vsiTf,
        jsonField: "vsi",
      },
      {
        title: "Load Balancers",
        path: "/form/lb",
        react_icon: "LoadBalancerVpc",
        toTf: lbTf,
        jsonField: "load_balancers",
      },
    ],
  },
  {
    name: "Power VS",
    links: [
      {
        title: "Power VS Workspace",
        path: "/form/power",
        react_icon: "IbmPowerVs",
        toTf: (config) => {
          return powerVsTf(config) || "";
        },
        jsonField: "power",
      },
      {
        title: "Power VS Instances",
        path: "/form/powerInstances",
        react_icon: "IbmPowerVsInstance",
        toTf: (config) => {
          return powerInstanceTf(config) || "";
        },
        jsonField: "power_instances",
      },
      {
        title: "Power VS Storage",
        path: "/form/powerVolumes",
        react_icon: "IbmPowerVsVolumes",
        toTf: (config) => {
          return powerVsVolumeTf(config) || "";
        },
        jsonField: "power_volumes",
      },
    ],
  },
  {
    name: "Advanced Features",
    links: [
      {
        title: "Security Compliance Center",
        path: "/form/securityComplianceCenter",
        react_icon: "IbmCloudSecurityComplianceCenter",
        toTf: sccTf,
        jsonField: "scc",
      },
      {
        title: "DNS Service",
        path: "/form/dns",
        react_icon: "DnsServices",
        toTf: dnsTf,
        jsonField: "dns",
      },
      {
        title: "VPN Servers",
        path: "/form/vpnServers",
        toTf: vpnServerTf,
        jsonField: "vpn_servers",
        react_icon: "ServerProxy",
      },
      {
        title: "F5 Big IP",
        path: "/form/f5",
        react_icon: "F5Icon",
        jsonField: "f5_vsi",
        toTf: f5Tf,
      },
      {
        title: "Access Groups",
        path: "/form/accessGroups",
        react_icon: "GroupAccess",
        toTf: iamTf,
        jsonField: "access_groups",
      },
      {
        title: "IAM Account Settings",
        path: "/form/iamAccountSettings",
        react_icon: "IdManagement",
        toTf: (json) => codeMirrorFormatIamAccountSettingsTf(json),
        jsonField: "iam_account_settings",
      },
      {
        title: "Context Based Restrictions",
        path: "/form/cbr",
        react_icon: "CBRIcon",
        toTf: cbrTf,
      },
    ],
  },
  {
    name: "Final Steps",
    links: [
      {
        title: "Summary",
        path: "/summary",
        react_icon: "Report",
      },
    ],
  },
];

module.exports = navCatagories;
