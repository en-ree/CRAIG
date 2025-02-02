import React from "react";
import { Button } from "@carbon/react";
import { DeleteModal } from "icse-react-assets";
import { ProjectFormModal } from "./ProjectFormModal";
import { JSONModal } from "./JSONModal";
import { azsort } from "lazy-z";
import { Add, MagicWandFilled } from "@carbon/icons-react";
import "./project.css";
import { ProjectTile } from "./ProjectTile";
import { CraigHeader } from "../SplashPage";
import { templates } from "../../utils";
import { LoadingModal } from "./LoadingModal";
import { template_dropdown_map } from "../../../lib/constants";
import PropTypes from "prop-types";
import Wizard from "./Wizard";

class Projects extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      viewJSONModalOpen: false,
      deleteModalOpen: false,
      loadingModalOpen: false,
      loadingDone: false,
      schematicsFailed: false,
      clickedProject: "",
      clickedWorkspace: "",
      clickedWorkspaceUrl: "",
      wizardModal: false,
    };

    /* do not delete, for debugging */
    // this.state.debug = true
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleViewJSONModal = this.toggleViewJSONModal.bind(this);
    this.toggleDeleteModal = this.toggleDeleteModal.bind(this);
    this.toggleLoadingModal = this.toggleLoadingModal.bind(this);
    this.newProject = this.newProject.bind(this);
    this.onProjectSelect = this.onProjectSelect.bind(this);
    this.onEditClick = this.onEditClick.bind(this);
    this.onViewClick = this.onViewClick.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
    this.onSchematicsUploadClick = this.onSchematicsUploadClick.bind(this);
    this.onCreateWorkspaceClick = this.onCreateWorkspaceClick.bind(this);
    this.toggleWizard = this.toggleWizard.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      JSON.stringify(nextProps) !== JSON.stringify(this.props) ||
      JSON.stringify(nextState) !== JSON.stringify(this.state)
    );
  }

  toggleWizard() {
    this.setState({ wizardModal: !this.state.wizardModal });
  }

  toggleModal() {
    this.setState({ modalOpen: !this.state.modalOpen });
  }

  toggleViewJSONModal() {
    this.setState({ viewJSONModalOpen: !this.state.viewJSONModalOpen });
  }

  toggleDeleteModal() {
    this.setState({ deleteModalOpen: !this.state.deleteModalOpen });
  }

  toggleLoadingModal() {
    this.setState({
      loadingModalOpen: !this.state.loadingModalOpen,
      loadingDone: false,
      schematicsFailed: false,
    });
  }

  newProject() {
    this.setState({
      modalData: {
        name: "",
        description: "",
        use_template: false,
        use_schematics: false,
      },
      modalOpen: true,
    });
  }

  /**
   * on project select
   * @param {string} keyName project key name
   * @returns {Function} event function
   */
  onProjectSelect(keyName) {
    return (event) => {
      if (
        !event.target.id.includes("edit-proj") &&
        !event.target.id.includes("delete-proj") &&
        !event.target.id.includes("view-json") &&
        !event.target.id.includes("schematics-upload") &&
        !event.target.id.includes("schematics-create")
      ) {
        if (
          // deselection only allowed when debug is true
          this.props.current_project === keyName &&
          this.state.debug
        ) {
          this.props.onProjectDeselect();
        } else if (
          // not already selected
          this.props.current_project !== keyName
        ) {
          this.props.onProjectSelect(this.props.projects[keyName].project_name);
        }
      }
    };
  }

  /**
   * on edit click
   * @param {string} keyName project key name
   * @returns {Function} event function
   */
  onEditClick(keyName) {
    return () => {
      this.setState({
        modalData: this.props.projects[keyName],
        modalOpen: true,
      });
    };
  }

  /**
   * on view click
   * @param {string} keyName project key name
   * @returns {Function} event function
   */
  onViewClick(keyName) {
    return () => {
      this.setState({
        viewJSONModalData: {
          name: this.props.projects[keyName].name,
          json: this.props.projects[keyName].json,
        },
        viewJSONModalOpen: true,
      });
    };
  }

  /**
   * on delete click
   * @param {string} keyName project key name
   * @returns {Function} event function
   */
  onDeleteClick(keyName) {
    return () => {
      this.setState({
        deleteProject: keyName,
        deleteModalOpen: true,
      });
    };
  }

  /**
   * on upload to schematics click
   * @param {string} keyName project key name
   * @returns {Function} event function
   */
  onSchematicsUploadClick(keyName) {
    return () => {
      this.setState(
        {
          clickedProject: this.props.projects[keyName].name,
          clickedWorkspace: this.props.projects[keyName].workspace_name,
          // fix data before retry
          loadingModalOpen: false,
          loadingDone: false,
          schematicsFailed: false,
        },
        () => {
          this.toggleLoadingModal();
          let notification = {
            title: "Success",
            kind: "success",
            text: `Starting upload to ${this.props.projects[keyName].workspace_name}`,
            timeout: 3000,
          };
          this.props.notify(notification);

          return fetch(
            `/api/schematics/tar/${this.props.projects[keyName].workspace_name}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(this.props.projects[keyName].json),
            }
          )
            .then((res) => res.json())
            .then((data) => {
              if (data.error) {
                throw data.error;
              } else {
                let notification = {
                  title: "Success",
                  kind: "success",
                  text: `Successfully uploaded to Schematics`,
                  timeout: 3000,
                };
                this.setState({
                  loadingDone: true,
                  clickedWorkspaceUrl:
                    this.props.projects[keyName].workspace_url,
                });
                this.props.notify(notification);
              }
            })
            .catch((err) => {
              console.error(err);
              let notification = {
                title: "Error",
                kind: "error",
                text: "Upload failed with error: " + err || err.message,
                timeout: 3000,
              };
              this.setState({
                loadingDone: true,
                schematicsFailed: true,
              });
              this.props.notify(notification);
            });
        }
      );
    };
  }

  /**
   * on create workspace click
   * @param {string} keyName project key name
   * @returns {Function} event function
   */
  onCreateWorkspaceClick(keyName) {
    return () => {
      let modalData = Object.assign({}, this.props.projects[keyName]);
      modalData.use_schematics = true;

      this.setState({
        modalData,
        modalOpen: true,
      });
    };
  }

  render() {
    let projectKeys = Object.keys(this.props.projects).sort(azsort);
    return (
      <div className="projects">
        <Wizard
          show={this.state.wizardModal}
          onRequestClose={this.toggleWizard}
          projects={this.props.projects}
          onProjectSave={this.props.onProjectSave}
        />
        {this.state.modalOpen && (
          <ProjectFormModal
            open={this.state.modalOpen}
            data={this.state.modalData}
            onClose={this.toggleModal}
            onSubmit={this.props.onProjectSave}
            projects={this.props.projects}
            templates={templates}
          />
        )}
        {this.state.viewJSONModalOpen && (
          <JSONModal
            open={this.state.viewJSONModalOpen}
            data={this.state.viewJSONModalData}
            onClose={this.toggleViewJSONModal}
            onSubmit={() => {
              this.toggleViewJSONModal();
            }}
          />
        )}
        {this.state.deleteModalOpen && (
          <DeleteModal
            modalOpen={this.state.deleteModalOpen}
            name={this.state.deleteProject}
            onModalClose={this.toggleDeleteModal}
            additionalText={
              this.props.projects[this.state.deleteProject].use_schematics
                ? `The Schematics Workspace '${
                    this.props.projects[this.state.deleteProject].workspace_name
                  }' for this project will not be deleted.`
                : ""
            }
            onModalSubmit={() => {
              this.props.onProjectDelete(this.state.deleteProject);
              this.toggleDeleteModal();
            }}
          />
        )}
        {this.state.loadingModalOpen && (
          <LoadingModal
            className="alignItemsCenter"
            action="upload"
            project={this.state.clickedProject}
            workspace={this.state.clickedWorkspace}
            open={this.state.loadingModalOpen}
            completed={this.state.loadingDone}
            workspace_url={this.state.clickedWorkspaceUrl}
            toggleModal={this.toggleLoadingModal}
            failed={this.state.schematicsFailed}
            // props for retry
            projects={this.props.projects}
            retryCallback={this.onSchematicsUploadClick(
              this.state.clickedProject
            )}
            lastWorkspaceName={this.state.clickedWorkspace}
          />
        )}
        <CraigHeader />

        <div id="projects" className="body">
          <h3 className="marginBottomXs">Projects</h3>
          <p className="marginBottom">
            Create, deploy, and manage scalable infrastructure on IBM Cloud with
            CRAIG. Choose from the below saved Projects, import an existing
            configuration as a Project, or create a new configuration and save
            it as a Project to work on later.
          </p>
          <div className="marginBottomXs">
            <legend className="cds--label marginBottomSmall">
              Create a Project
            </legend>

            <Button
              id="new-project"
              kind="primary"
              className="projectButton marginLeftMed"
              onClick={this.newProject}
              iconDescription="Create new project"
              renderIcon={Add}
            >
              Create a New Project
            </Button>
            <Button
              id="project-wizard"
              kind="tertiary"
              className="projectButton marginLeftMed"
              onClick={this.toggleWizard}
              iconDescription="Create new project"
              renderIcon={MagicWandFilled}
            >
              Setup Wizard
            </Button>
          </div>
          {/* hide projects section if there are none */}
          {projectKeys.length > 0 && (
            <div className="projectSelect">
              <legend className="cds--label marginBottomSmall">
                Select a Project
              </legend>
              <div className="projectTiles marginLeftMed">
                {/* projects */}
                {projectKeys.map((keyName) => (
                  <ProjectTile
                    key={keyName}
                    keyName={keyName}
                    data={this.props.projects[keyName]}
                    current_project={this.props.current_project}
                    onProjectSelect={this.onProjectSelect(keyName)}
                    onEditClick={this.onEditClick(keyName)}
                    onViewClick={this.onViewClick(keyName)}
                    onDeleteClick={this.onDeleteClick(keyName)}
                    onSchematicsUploadClick={this.onSchematicsUploadClick(
                      keyName
                    )}
                    onCreateWorkspaceClick={this.onCreateWorkspaceClick(
                      keyName
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

Projects.propTypes = {
  current_project: PropTypes.string,
  projects: PropTypes.shape({}).isRequired,
  onProjectSelect: PropTypes.func.isRequired,
  notify: PropTypes.func.isRequired,
  onProjectSave: PropTypes.func.isRequired,
  onProjectDelete: PropTypes.func.isRequired,
  onProjectDeselect: PropTypes.func.isRequired,
};

export default Projects;
