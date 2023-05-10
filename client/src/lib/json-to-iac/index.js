const {
  appidTf,
  ibmResourceKeyAppId,
  ibmResourceInstanceAppId,
  ibmAppIdRedirectUrls
} = require("./appid");
const {
  atrackerTf,
  ibmAtrackerRoute,
  ibmAtrackerTarget
} = require("./atracker");
const {
  clusterTf,
  ibmContainerVpcCluster,
  ibmContainerVpcWorkerPool
} = require("./clusters");
const {
  eventStreamsTf,
  ibmResourceInstanceEventStreams
} = require("./event-streams");
const {
  f5Tf,
  f5CloudInitYaml,
  f5TemplateFile,
  f5Locals,
  f5ImageLocals,
  f5Images
} = require("./f5");
const {
  flowLogsTf,
  ibmIsFlowLog,
  ibmIamAuthorizationPolicyFlowLogs
} = require("./flow-logs");
const {
  formatIamAccountSettings,
  iamTf,
  ibmIamAccountSettings,
  ibmIamAccessGroup,
  ibmIamAccessGroupDynamicRule,
  ibmIamAccessGroupPolicy,
  ibmIamAccessGroupMembers
} = require("./iam");
const {
  kmsTf,
  ibmResourceInstanceKms,
  ibmKmsKeyPolicy,
  ibmKmsKey,
  ibmKmsKeyRings,
  ibmIamAuthorizationPolicyKms
} = require("./key-management");
const {
  cosTf,
  ibmResourceInstanceCos,
  ibmIamAuthorizationPolicyCos,
  ibmCosBucket,
  ibmResourceKeyCos
} = require("./object-storage");
const resourceGroupTf = require("./resource-groups");
const {
  sccTf,
  ibmSccPostureCredential,
  ibmSccAccountSettings,
  ibmSccPostureScope,
  ibmSccPostureCollector
} = require("./scc");
const {
  secretsManagerTf,
  ibmResourceInstanceSecretsManager,
  ibmIamAuthorizationPolicySecretsManager,
  formatSecretsManagerSecret
} = require("./secrets-manager");
const {
  sgTf,
  ibmIsSecurityGroupRule,
  ibmIsSecurityGroup
} = require("./security-groups");
const { sshKeyTf, ibmIsSshKey } = require("./ssh-keys");
const { tgwTf, ibmTgConnection, ibmTgGateway } = require("./transit-gateway");
const { tfBlock, tfDone } = require("./utils");
const {
  vpcTf,
  formatVpc,
  formatAcl,
  formatAclRule,
  formatPgw,
  formatSubnet,
  ibmIsVpc,
  ibmIsPublicGateway,
  ibmIsSubnet,
  ibmIsNetworkAclRule,
  ibmIsNetworkAcl,
  ibmIsVpcAddressPrefix,
  vpcModuleJson,
  vpcModuleOutputs
} = require("./vpc");
const {
  vpeTf,
  ibmIsVirtualEndpointGatewayIp,
  ibmIsVirtualEndpointGateway,
  ibmIsSubnetReservedIp
} = require("./vpe");
const { vpnTf, ibmIsVpnGateway } = require("./vpn");
const {
  vsiTf,
  lbTf,
  ibmIsLbPoolMembers,
  ibmIsLbListener,
  ibmIsLbPool,
  ibmIsInstance,
  ibmIsLb,
  ibmIsVolume
} = require("./vsi");
const { configToFilesJson } = require("./config-to-files-json");
const {
  codeMirrorVpcTf,
  codeMirrorAclTf,
  codeMirrorSubnetsTf,
  codeMirrorEventStreamsTf,
  codeMirrorFormatIamAccountSettingsTf,
  codeMirrorGetDisplay
} = require("./page-template");
const {
  formatRoutingTable,
  ibmIsVpcRoutingTable,
  ibmIsVpcRoutingTableRoute,
  formatRoutingTableRoute,
  routingTableTf
} = require("./routing-tables");
const { buildTitleComment } = require("./utils");
const {
  formatCbrZone,
  ibmCbrZone,
  formatCbrRule,
  ibmCbrRule,
  cbrTf
} = require("./cbr");
const {
  formatDnsService,
  formatDnsZone,
  formatDnsRecord,
  formatDnsPermittedNetwork,
  formatDnsCustomResolver,
  dnsTf
} = require("./dns");
module.exports = {
  buildTitleComment,
  formatPgw,
  formatSubnet,
  formatAcl,
  formatAclRule,
  tfDone,
  formatVpc,
  tfBlock,
  iamTf,
  formatIamAccountSettings,
  resourceGroupTf,
  lbTf,
  appidTf,
  atrackerTf,
  clusterTf,
  eventStreamsTf,
  f5Tf,
  f5CloudInitYaml,
  flowLogsTf,
  kmsTf,
  cosTf,
  sccTf,
  secretsManagerTf,
  sgTf,
  sshKeyTf,
  tgwTf,
  vpcTf,
  vpeTf,
  vpnTf,
  vsiTf,
  configToFilesJson,
  codeMirrorVpcTf,
  codeMirrorAclTf,
  codeMirrorSubnetsTf,
  codeMirrorEventStreamsTf,
  codeMirrorFormatIamAccountSettingsTf,
  codeMirrorGetDisplay,
  ibmIsLbPoolMembers,
  ibmIsLbListener,
  ibmIsLbPool,
  ibmIsInstance,
  ibmIsLb,
  ibmIsVolume,
  ibmIsVpnGateway,
  ibmIsVirtualEndpointGatewayIp,
  ibmIsVirtualEndpointGateway,
  ibmIsSubnetReservedIp,
  ibmIsVpc,
  ibmIsPublicGateway,
  ibmIsSubnet,
  ibmIsNetworkAclRule,
  ibmIsNetworkAcl,
  ibmIsVpcAddressPrefix,
  ibmTgConnection,
  ibmTgGateway,
  ibmResourceKeyAppId,
  ibmResourceInstanceAppId,
  ibmAppIdRedirectUrls,
  ibmIsSshKey,
  ibmAtrackerRoute,
  ibmAtrackerTarget,
  ibmContainerVpcCluster,
  ibmContainerVpcWorkerPool,
  ibmIsSecurityGroupRule,
  ibmIsSecurityGroup,
  ibmResourceInstanceSecretsManager,
  ibmIamAuthorizationPolicySecretsManager,
  ibmSccPostureCredential,
  ibmSccAccountSettings,
  ibmSccPostureScope,
  ibmSccPostureCollector,
  ibmResourceInstanceCos,
  ibmIamAuthorizationPolicyCos,
  ibmCosBucket,
  ibmResourceKeyCos,
  ibmResourceInstanceKms,
  ibmKmsKeyPolicy,
  ibmKmsKey,
  ibmKmsKeyRings,
  ibmIamAuthorizationPolicyKms,
  ibmIamAccountSettings,
  ibmIamAccessGroup,
  ibmIamAccessGroupDynamicRule,
  ibmIamAccessGroupPolicy,
  ibmIamAccessGroupMembers,
  ibmIsFlowLog,
  ibmIamAuthorizationPolicyFlowLogs,
  ibmResourceInstanceEventStreams,
  f5TemplateFile,
  f5Locals,
  f5ImageLocals,
  f5Images,
  formatRoutingTable,
  ibmIsVpcRoutingTable,
  ibmIsVpcRoutingTableRoute,
  formatRoutingTableRoute,
  routingTableTf,
  formatCbrZone,
  ibmCbrZone,
  formatCbrRule,
  ibmCbrRule,
  cbrTf,
  vpcModuleJson,
  vpcModuleOutputs,
  formatSecretsManagerSecret,
  formatDnsService,
  formatDnsZone,
  formatDnsRecord,
  formatDnsPermittedNetwork,
  formatDnsCustomResolver,
  dnsTf
};
