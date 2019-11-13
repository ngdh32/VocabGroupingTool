import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import Vocab from "./Vocab.js";

export default class VocabList extends React.Component {
  constructor(props) {
    super(props);
    // initialize

  }

  

  render() {
    const vocabss = this.props.vocabs;

    return (
      <ul class="list-group list-group-flush">
        {vocabss.map(x => {
          return (
            <li class={this.props.theme + " list-group-item"}>
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
                theme={this.props.theme}
              />
            </li>
          );
        })}
      </ul>
    );
  }
}
