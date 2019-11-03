import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink
} from "reactstrap";
import VocabList from "./VocabList.js";
import Edit from "./Edit.js";
import config from '../Config.js';
import ApiHelper from "../ApiHelper.js";

export default class Home extends React.Component {
    constructor(props) {
        super(props);


        this.navToggle = this.navToggle.bind(this);
        this.editToggle = this.editToggle.bind(this);
        this.editPanelOnChange = this.editPanelOnChange.bind(this);
        this.handleEditSubmittedClicked = this.handleEditSubmittedClicked.bind(this)
        this.getVocabList = this.getVocabList.bind(this);
        this.handleRemoveClicked = this.handleRemoveClicked.bind(this);
        this.toggleIsLoading = this.toggleIsLoading.bind(this);
        this.toggleisVocabLoading = this.toggleisVocabLoading.bind(this);
        this.state = {
            navIsOpen: false,
            editIsOpen: false,
            isLoading: false,
            isVocabLoading: false,
            editPanelObject: {
                id: null,
                parentId: null,
                word: "",
                meaning: "",
                example: "",
                userId: ""
            },
            vocabs: []
        };
    }

    // show/hide action loading spinner
    toggleIsLoading() {
        this.setState(prev => {
            return {
                isLoading: !prev.isLoading
            }
        })
    }

    // show/hide vocab list loading spinner
    toggleisVocabLoading() {
        this.setState(prev => {
            return {
                isVocabLoading: !prev.isVocabLoading
            }
        })
    }

    getVocabList() {
        var bearer = 'Bearer ' + this.props.vgt_auth;

        var requestConfigObject = {
            method: 'GET',
            headers: {
                'Authorization': bearer
            }
        }

        const _this = this;

        // show loading spinner
        _this.toggleisVocabLoading();

        // retrieve vocab list
        ApiHelper.callApi("/api/vocabs/", requestConfigObject, _this.props.handleRemoveAuthCookie
        , (res) => {
            _this.setState({ vocabs: res.data });
            _this.toggleisVocabLoading();
        }, (error) => {
            _this.toggleisVocabLoading();
        })
    }

    componentDidMount() {
        this.getVocabList();
    }

    // handle the chnage of input in edit panel
    editPanelOnChange(object) {
        this.setState({
            editPanelObject: object
        });
    }

    // show/hide edit panel
    editToggle() {
        this.setState({
            editIsOpen: !this.state.editIsOpen
        });

        // initialize the edit panel input
        this.setState({
            editPanelObject: {
                id: null,
                parentId: null,
                word: "",
                meaning: "",
                example: "",
                userId: ""
            }
        })
    }

    // show/hide navigator
    navToggle() {
        this.setState({
            navIsOpen: !this.state.navIsOpen
        });
    }

    handleRemoveClicked(deleteId) {
        var bearer = 'Bearer ' + this.props.vgt_auth;

        var requestConfigObject = {
            method: 'Delete',
            headers: {
                'Authorization': bearer
            }
        }

        const _this = this;
        const url = "/api/vocabs/" + deleteId;

        ApiHelper.callApi(url, requestConfigObject, _this.props.handleRemoveAuthCookie
        , (res) => {
            if (res.code == 200) {
                _this.getVocabList();
            } else {
                console.log(res);
            }
        }, (error) => {
            // to implement...
        })
    }

    handleEditSubmittedClicked() {
        var bearer = 'Bearer ' + this.props.vgt_auth;

        var requestConfigObject = {
            method: 'Post',
            headers: {
                'Authorization': bearer,
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(this.state.editPanelObject)
        }

        const _this = this;
        // if id is not undefined, it is a create action. If id is not empty, it is an edit action
        const url = "/api/vocabs/" + (_this.state.editPanelObject.id == null || _this.state.editPanelObject.id == undefined ? "" : _this.state.editPanelObject.id);

        // show loading spinner
        this.toggleIsLoading()

        // retrieve vocab list
        ApiHelper.callApi(url, requestConfigObject, _this.props.handleRemoveAuthCookie
        , (res) => {
            if (res.code == 200) {
                _this.editToggle();
                _this.getVocabList();
                _this.toggleIsLoading();
            } 
        }, (error) => {
            _this.toggleIsLoading();
        })
    }

    render() {
        return (
            <div>
                <div>
                    <Navbar
                        color="light"
                        light
                        expand="md"
                        className="border-bottom border-primary"
                        fixed="top"
                    >
                        <NavbarBrand href="/" className="text-primary">
                            VGT
            </NavbarBrand>
                        <NavbarToggler onClick={this.navToggle} />
                        <Collapse isOpen={this.state.navIsOpen} navbar>
                            <Nav className="ml-auto" navbar>
                                {/* <NavItem>
                                    <form class="form-inline my=2 my-lg-0">
                                        <input
                                            class="form-control mr-sm-2"
                                            type="search"
                                            placeholder="Search Vocab"
                                            aria-label="Search"
                                        />
                                        <button class="btn btn-primary my-2 my-sm-0" type="button">
                                            Search
                    </button>
                                    </form>
                                </NavItem> */}
                                <NavItem>
                                    <NavLink
                                        href="#"
                                        className="text-primary"
                                        onClick={this.editToggle}
                                    >
                                        add vocab
                  </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink href="#" className="text-primary" onClick={this.props.handleRemoveAuthCookie}>
                                        Logout
                  </NavLink>
                                </NavItem>
                            </Nav>
                        </Collapse>
                    </Navbar>
                </div>
                <div class="container">
                    {this.state.isVocabLoading ?
                        (
                            <div class='row justify-content-center'>
                                <div class="spinner-border text-primary" role="status">
                                </div>
                            </div>
                        ) : (
                            <div></div>
                        )

                    }
                    <VocabList vocabs={this.state.vocabs} editToggle={this.editToggle} editPanelOnChange={this.editPanelOnChange} handleRemoveClicked={this.handleRemoveClicked}
                    />
                </div>
                <Edit
                    isOpen={this.state.editIsOpen}
                    toggle={this.editToggle}
                    editPanelObject={this.state.editPanelObject}
                    editPanelOnChange={this.editPanelOnChange}
                    handleEditSubmittedClicked={this.handleEditSubmittedClicked}
                    isLoading={this.state.isLoading}
                />
            </div>
        );
    }
}
