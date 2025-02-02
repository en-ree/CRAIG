import React from "react";
import PropTypes from "prop-types";
import { Download, Copy } from "@carbon/icons-react";
import { Button } from "@carbon/react";
import { downloadContent } from "./DownloadConfig";
import { formatConfig } from "../../../lib";

export const DownloadCopyButtonSet = (props) => {
  return (
    <>
      <Button
        className="marginRightMed"
        onClick={() => downloadContent(props.json, props.projectName)}
        disabled={props.disabled}
        renderIcon={Download}
        kind={props.tertiaryDownload ? "tertiary" : undefined}
        iconDescription="Download craig.zip Terraform code"
      >
        Download Terraform
      </Button>
      <Button
        className="marginRightMed"
        kind="tertiary"
        onClick={() =>
          navigator.clipboard.writeText(formatConfig(props.json, true))
        }
        renderIcon={Copy}
        iconDescription="Copy JSON to clipboard"
        disabled={props.disabled}
        tooltipAlignment="end"
      >
        Copy JSON
      </Button>
    </>
  );
};

DownloadCopyButtonSet.defaultProps = {
  json: {},
  disabled: true,
  tertiaryDownload: false,
};

DownloadCopyButtonSet.propTypes = {
  json: PropTypes.object.isRequired,
  disabled: PropTypes.bool.isRequired,
  tertiaryDownload: PropTypes.bool.isRequired,
};
