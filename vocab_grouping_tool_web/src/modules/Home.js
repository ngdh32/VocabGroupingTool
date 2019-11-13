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
import Cookies from 'universal-cookie';
import VGTNavbar from "./VGTNavbar"

export default class Home extends React.Component {
    constructor(props) {
        super(props);

        this.cookie = new Cookies();
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
            theme: this.cookie.get("vgt_theme") == undefined ? config.default_theme : this.cookie.get("vgt_theme"),
            editPanelObject: {
                id: null,
                parentId: null,
                word: "",
                meaning: "",
                example: "",
                userId: ""
            },
            vocabs: [],
            displayVocabs: [],
            searchKey: ""
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
            _this.setState({ vocabs: res.data, displayVocabs: res.data,searchKey: "" });
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

    handleSetTheme = (themeId) => {
        this.setState({
            theme: themeId
        });
        this.cookie.set(this.props.vgt_theme, themeId,{ maxAge: 60 * 60 * 24 * 365});
    }


    handleSearchInputChange = (event) => {
        let searchKey = event.target.value;
        this.setState({searchKey: searchKey});
        if (searchKey == ""){
            this.setState({displayVocabs: this.state.vocabs});
        }else{
            let toSearchVocabs = JSON.parse(JSON.stringify(this.state.vocabs));
            const searchedVocabs = this.searchMatchVocabs(searchKey, toSearchVocabs);
            this.setState({displayVocabs: searchedVocabs });
            
        }
    }

    searchMatchVocabs = function(serachKey, vocabs){
        let matchVocabs = [];
        for(let i=0;i<vocabs.length;i++){
            if (vocabs[i].subVocabs != undefined && vocabs[i].subVocabs.length > 0){
                Array.prototype.push.apply(matchVocabs,this.searchMatchVocabs(serachKey, vocabs[i].subVocabs));
            }

            if (vocabs[i].word.toUpperCase().startsWith(serachKey.toUpperCase())){
                vocabs[i].subVocabs = [];
                matchVocabs.push(vocabs[i]);
            }
            
        }
        return matchVocabs;
    }

    render() {
        return (
            <div className={this.state.theme + " appBackground Home"}>
                <VGTNavbar 
                    handleRemoveAuthCookie={this.props.handleRemoveAuthCookie}
                    navToggle={this.navToggle}
                    navIsOpen={this.state.navIsOpen}
                    editToggle={this.editToggle}
                    theme={this.state.theme}
                    handleSetTheme={this.handleSetTheme}
                    handleSearchInputChange={this.handleSearchInputChange}
                    searchKey={this.state.searchKey}
                />
                <div class="container">
                    {this.state.isVocabLoading ?
                        (
                            <div class='row justify-content-center'>
                                <div class={this.state.theme + " spinner-border"} role="status">
                                </div>
                            </div>
                        ) : (
                            <div></div>
                        )

                    }
                    <VocabList vocabs={this.state.displayVocabs} editToggle={this.editToggle} editPanelOnChange={this.editPanelOnChange} handleRemoveClicked={this.handleRemoveClicked} theme={this.state.theme}
                    />
                </div>
                <Edit
                    isOpen={this.state.editIsOpen}
                    toggle={this.editToggle}
                    editPanelObject={this.state.editPanelObject}
                    editPanelOnChange={this.editPanelOnChange}
                    handleEditSubmittedClicked={this.handleEditSubmittedClicked}
                    isLoading={this.state.isLoading}
                    theme={this.state.theme}
                />
            </div>
        );
    }
}
