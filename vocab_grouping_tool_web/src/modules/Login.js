import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter
} from "react-router-dom";
import { Collapse, Button } from "reactstrap";
import config from '../Config.js';
import ApiHelper from "../ApiHelper.js";


class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      password: "",
      errorMsg: "",
      isLoading: false
    }

    this.handleChangeEvent = this.handleChangeEvent.bind(this);
    this.handleLoginClickEvent = this.handleLoginClickEvent.bind(this);
    this.handleRegisterClickEvent = this.handleRegisterClickEvent.bind(this);
    this.toggleIsLoading = this.toggleIsLoading.bind(this);

  }

  handleChangeEvent(event) {
    console.log(event.target.name)
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  toggleIsLoading() {
    this.setState(prev => {
      return {
        isLoading: !prev.isLoading
      }
    })
  }

  handleLoginClickEvent() {
    // reset the error message
    this.setState({
      errorMsg: ""
    })
    const requestConfigObject = {
      method: 'POST', // or 'PUT'
      body: JSON.stringify(this.state), // data can be `string` or {object}!
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const _this = this;

    const url = "/api/Authentication/Login";

    this.toggleIsLoading();

    ApiHelper.callApi(url, requestConfigObject, null
      , (res) => {
        _this.toggleIsLoading()
        if (res.code == 1999) {
          _this.setState({
            errorMsg: res.message
          })
        } else {
          _this.props.handleSetAuthCookie(res.data);
        }
      }, (error) => {
        _this.toggleIsLoading()
        console.log(error)
        _this.setState({ errorMsg: error.Message })
      })
  }

  handleRegisterClickEvent() {
    this.setState({
      errorMsg: ""
    })

    const _this = this;
    const url = "/api/Authentication/Register";
    const requestConfigObject = {
      method: 'POST', // or 'PUT'
      body: JSON.stringify(this.state), // data can be `string` or {object}!
      headers: {
        'Content-Type': 'application/json'
      }
    }

    this.toggleIsLoading()

    ApiHelper.callApi(url, requestConfigObject, null
      , (res) => {
        _this.toggleIsLoading()
        if (res.code == 1999) {
          this.setState({
            errorMsg: res.message
          })
        } else {
          _this.handleLoginClickEvent();
        }
      }, (error) => {
        _this.toggleIsLoading()
        console.log(error)
        _this.setState({ errorMsg: error.Message })
      })

  }


  render() {
    const authenticated = this.props.vgt_auth == "" || this.props.vgt_auth == undefined || this.props.vgt_auth == null ? false : true;
    return (
      <div>
        <div class='vertical-center'>
          <div class='container'>
            <div class='row justify-content-center'>
              <div class="col col-lg-6 col-12">
                <div class="card border-primary">
                  <div class="card-body">
                    <h4 class="card-title text-center">VGT</h4>
                    <div class="form-group">
                      <input type="email" class="form-control" aria-describedby="emailHelp" placeholder="Enter email" value={this.state.name} onChange={this.handleChangeEvent} name="name" />
                    </div>
                    <div class="form-group">
                      <input type="password" class="form-control" placeholder="Password" value={this.state.password} onChange={this.handleChangeEvent} name="password" />
                    </div>
                    <div class='row justify-content-center'>
                      <Button className="loginButtom" color="primary" onClick={this.handleLoginClickEvent} disabled={this.state.isLoading}>
                        Login
                      </Button>

                      <Button className="loginButtom" color="primary" onClick={this.handleRegisterClickEvent} disabled={this.state.isLoading}>
                        Register
                      </Button>
                      {this.state.isLoading ?
                        (
                          <div class="spinner-border text-primary" role="status">
                          </div>
                        ) : (
                          <div></div>
                        )

                      }

                    </div>
                    <h6>{this.state.errorMsg}</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {
          authenticated ? (
            <Redirect
              to={{
                pathname: "/"
              }}
            />
          ) : (
              <div></div>
            )
        }
      </div>
    );
  }
}

export default Login;
