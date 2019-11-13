import React from "react";
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from "reactstrap";


export default class VGTNavbar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            themeDropdownOpen: false
        }


    }

    handleThemeDropdownToggle = (event) => {
        this.setState(prev => {
            return {
                themeDropdownOpen: !prev.themeDropdownOpen
            }
        })
    }

    handleThemeDowndownOnclick = (themeId) => {
        this.handleThemeDropdownToggle();
        this.props.handleSetTheme(themeId);
    }

    // handleSearchInputChange = (event) => {
    //     this.setState({searchKey: event.target.value});
    //     this.props.handleSearchInputChange(event.target.value)
    // }

    render() {
        return (
            <div>
                <Navbar
                    expand="md"
                    className={this.props.theme + " appNavbar border-bottom"}
                    fixed="top"
                >
                    <NavbarBrand href="/" className={this.props.theme + " navbarText"}>
                        VGT
                    </NavbarBrand>
                    <NavbarToggler onClick={this.props.navToggle} className={this.props.theme + " navbar-light"}/>
                    <Collapse isOpen={this.props.navIsOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            <form class="form-inline my-2 my-lg-0">
                                <input class={this.props.theme + " input form-control"} type="search" placeholder="Search" aria-label="Search" value={this.props.searchKey} onChange={this.props.handleSearchInputChange}/>
                            </form>
                            <NavItem>
                                <NavLink
                                    href="#"
                                    onClick={this.props.editToggle}
                                    className={this.props.theme + " navbarText"}
                                >
                                    Add Vocab
                                 </NavLink>
                            </NavItem>
                            <NavItem>
                                <Dropdown isOpen={this.state.themeDropdownOpen} toggle={this.handleThemeDropdownToggle} className={this.props.theme}>
                                    <DropdownToggle className="nav-link"  caret>
                                        Theme
                                        </DropdownToggle>
                                    <DropdownMenu className={this.props.theme}>
                                        <DropdownItem className={this.props.theme + " navbarDropdownListItem"} onClick={() => this.handleThemeDowndownOnclick("classic")}>Classic</DropdownItem>
                                        <DropdownItem className={this.props.theme + " navbarDropdownListItem"} onClick={() => this.handleThemeDowndownOnclick("classicpink")}>Classic Pink</DropdownItem>
                                        <DropdownItem className={this.props.theme + " navbarDropdownListItem"} onClick={() => this.handleThemeDowndownOnclick("greendark")}>Matrix</DropdownItem>
                                        <DropdownItem className={this.props.theme + " navbarDropdownListItem"} onClick={() => this.handleThemeDowndownOnclick("reddark")}>Red Dark</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </NavItem>
                            <NavItem>
                                <NavLink 
                                    href="#" 
                                    //className="text-primary" 
                                    onClick={this.props.handleRemoveAuthCookie}
                                    className={this.props.theme + " navbarText"}
                                    >
                                    Logout
                                </NavLink>
                            </NavItem>
                            
                        </Nav>
                    </Collapse>
                </Navbar>
            </div>
        )
    }
}