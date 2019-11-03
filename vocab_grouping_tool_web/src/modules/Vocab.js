import React from "react";
import { Collapse, Button } from "reactstrap";

const iconStyle = {

};

export default class Vocab extends React.Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.editClick = this.editClick.bind(this);
        this.addClick = this.addClick.bind(this);
        this.deleteClick = this.deleteClick.bind(this);
        this.state = {
            isOpen: false
        };
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    addClick(e) {
        // avoid open safari in IOS
        e.preventDefault();

        let editObject = {
            id: null,
            word: "",
            meaning: "",
            example: "",
            parentId: null,
            userId: ""
        };
        editObject.parentId = this.props.id;


        this.props.editToggle();
        this.props.editPanelOnChange(editObject);

    }

    editClick(e) {
        // avoid open safari in IOS
        e.preventDefault();

        let editObject = {
            id: null,
            word: "",
            meaning: "",
            example: "",
            parentId: null,
            userId: ""
        };


        editObject.id = this.props.id;
        editObject.word = this.props.word;
        editObject.meaning = this.props.meaning;
        editObject.example = this.props.example;
        editObject.parentId = this.props.parentId;

        this.props.editToggle();
        this.props.editPanelOnChange(editObject);

    }

    deleteClick(e, deleteId) {
        // avoid open safari in IOS
        e.preventDefault();

        this.props.handleRemoveClicked(deleteId);
    }


    render() {
        const subVocabs = this.props.subVocabs;
        return (
            <div
                class={this.props.subVocabs.length > 0 ? "card border-primary" : "card"}
            >
                <div class="card-body">
                    <div class="row">
                        <div class="col">
                            <h5 class="card-title font-weight-bold">
                                {this.props.word}
                                {/* <a href="#">
                                    <i class="material-icons" style={iconStyle}>
                                        volume_down
                  </i>
                                </a> */}
                                : {this.props.meaning}
                            </h5>
                        </div>
                        <div class="col-auto">
                            <a href="#" onClick={(e) => { this.addClick(e) }}>
                                <i class="material-icons vocabIcon">
                                    add_circle
                </i>
                            </a>
                            <a href="#" onClick={(e) => { this.editClick(e) }}>
                                <i class="material-icons vocabIcon">
                                    edit
                </i>
                            </a>
                            <a href="#" onClick={(e) => this.deleteClick(e, this.props.id)}>
                                <i class="material-icons vocabIcon">
                                    cancel
                </i>
                            </a>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <p class="card-text">Example: </p>
                            <p class="card-text">{this.props.example}</p>
                        </div>
                        <div class="col col-auto vocabDivMore">
                            {this.props.subVocabs.length > 0 && (
                                <Button color="primary" onClick={this.toggle}>
                                    More
                </Button>
                            )}
                        </div>
                    </div>
                </div>
                <Collapse isOpen={this.state.isOpen}>
                    <ul class="list-group">
                        {subVocabs.map(x => {
                            return (
                                <li class="list-group-item">
                                    <Vocab
                                        id={x.id}
                                        parentId={x.parentId}
                                        word={x.word}
                                        meaning={x.meaning}
                                        example={x.example}
                                        subVocabs={x.subVocabs}
                                        editToggle={this.props.editToggle}
                                        editPanelOnChange={this.props.editPanelOnChange}
                                        handleRemoveClicked={this.props.handleRemoveClicked}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                </Collapse>
            </div>
        );
    }
}
