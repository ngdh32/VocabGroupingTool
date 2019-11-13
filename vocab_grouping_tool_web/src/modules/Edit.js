import React from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input
} from "reactstrap";

export default class Edit extends React.Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmitClicked = this.handleSubmitClicked.bind(this)
  }

  handleChange(e) {
    const object = this.props.editPanelObject;
    object[e.target.name] = e.target.value;
    this.props.editPanelOnChange(object);
  }

  handleSubmitClicked() {
    this.props.handleEditSubmittedClicked();
  }



  render() {
    return (
      <div>
        <Modal
          isOpen={this.props.isOpen}
          toggle={this.props.toggle}
          className={this.props.className}
        >
          {/*<ModalHeader toggle={this.props.toggle}></ModalHeader> */}
          <ModalBody className={this.props.theme + " editBacgkround"}>
            <Form>
              <FormGroup>
                <Label for="txtWord" className={this.props.theme + " card-text"}>Word</Label>
                <Input
                  onChange={this.handleChange}
                  type="text"
                  name="word"
                  id="txtWord"
                  placeholder="Word"
                  value={this.props.editPanelObject.word}
                  className={this.props.theme + " input"}
                />
              </FormGroup>
              <FormGroup>
                <Label for="txtMeaning" className={this.props.theme + " card-text"}>Meaning</Label>
                <Input
                  onChange={this.handleChange}
                  type="text"
                  name="meaning"
                  id="txtMeaning"
                  placeholder="Meaning"
                  value={this.props.editPanelObject.meaning}
                  className={this.props.theme + " input"}
                />
              </FormGroup>
              <FormGroup>
                <Label for="txtExample" className={this.props.theme + " card-text"}>Example</Label>
                <Input
                  onChange={this.handleChange}
                  type="textarea"
                  name="example"
                  id="txtExample"
                  placeholder="Example"
                  value={this.props.editPanelObject.example}
                  className={this.props.theme + " input"}
                />
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter className={this.props.theme + " editBacgkroundFooter"}>
            { 
                this.props.isLoading ?
                (
                <div class={this.props.theme + "spinner-border"} role="status">
                </div> 
                ) : (
                  <div></div>
                )

            }
            <Button className={this.props.theme + " button"} onClick={this.handleSubmitClicked} disabled={this.props.isLoading}>
              Confirm
            </Button>{" "}
            <Button color="secondary" onClick={this.props.toggle} disabled={this.props.isLoading}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}
