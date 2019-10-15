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
            isVocabLoading:false,
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

    toggleIsLoading(){
        this.setState(prev => {
          return {
            isLoading: !prev.isLoading
          }
        })
        // this.state.isLoading = !this.state.isLoading;
      }

      toggleisVocabLoading(){
        this.setState(prev => {
          return {
            isVocabLoading: !prev.isVocabLoading
          }
        })
        // this.state.isLoading = !this.state.isLoading;
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

        _this.toggleisVocabLoading();

        fetch(config.vgt_core_url + "/api/vocabs/", requestConfigObject)
            .then(function (response) {
                _this.toggleisVocabLoading();
                if (response.ok) {
                    return response.json();
                } else if (response.status == '401') {
                    _this.props.handleRemoveAuthCookie();
                }
            })
            .then(myJson => {
                this.setState({ vocabs: myJson.data });
            }).catch(function (error) {
                _this.toggleisVocabLoading();
                console.log(error);
            });
    }

    componentDidMount() {
        this.getVocabList();
    }

    editPanelOnChange(object) {
        this.setState({
            editPanelObject: object
        });
    }

    editToggle() {
        this.setState({
            editIsOpen: !this.state.editIsOpen
        });

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

    navToggle() {
        this.setState({
            navIsOpen: !this.state.navIsOpen
        });
    }

    handleRemoveClicked(deleteId){
        var bearer = 'Bearer ' + this.props.vgt_auth;

        var requestConfigObject = {
            method: 'Delete',
            headers: {
                'Authorization': bearer
            }
        }

        const _this = this;
        const url = config.vgt_core_url + "/api/vocabs/" + deleteId;

        console.log(url)

        // this.toggleIsLoading();

        fetch(url, requestConfigObject)
            .then(function (response) {
                // _this.toggleIsLoading();
                if (response.ok) {
                    return response.json();
                } else if (response.status == '401') {
                    _this.props.handleRemoveAuthCookie();
                }
            })
            .then(myJson => {
                console.log(myJson)
                if (myJson.code == 200) {
                    this.getVocabList();
                } else {
                    console.log(myJson);
                }
            }).catch(function (error) {
                // _this.toggleIsLoading()
                console.log(error);
            });
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

        console.log(this.state.editPanelObject)

        const _this = this;
        const url = config.vgt_core_url + "/api/vocabs/" + (_this.state.editPanelObject.id == null || _this.state.editPanelObject.id == undefined ? "" : _this.state.editPanelObject.id);

        console.log(url)

        this.toggleIsLoading()

        fetch(url, requestConfigObject)
            .then(function (response) {
                _this.toggleIsLoading()
                if (response.ok) {
                    return response.json();
                } else if (response.status == '401') {
                    _this.props.handleRemoveAuthCookie();
                }
            })
            .then(myJson => {
                console.log(myJson)
                if (myJson.code == 200) {
                    _this.editToggle();
                    this.getVocabList();
                } else {
                    console.log(myJson);
                }
            }).catch(function (error) {
                _this.toggleIsLoading()
                console.log(error);
            });
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
                    { this.state.isVocabLoading ?
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
