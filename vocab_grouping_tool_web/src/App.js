import React from 'react';
import logo from './logo.svg';
import './App.css';
import Home from './modules/Home.js'
import Login from './modules/Login.js'
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter
} from "react-router-dom";
import Cookies from 'universal-cookie';




function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route 
      {...rest}
      render={props =>
        rest.vgt_auth ? (
          <Component {...rest}/>
        ) : (
            <Redirect
              to={{
                pathname: "/login"
              }}
            />
          )
      }
    />
  );
}

// const AuthButton = withRouter(
//   ({ history }) =>
//     fakeAuth.isAuthenticated ? (
//       <p>
//         Welcome!{" "}
//         <button
//           onClick={() => {
//             fakeAuth.signout(() => history.push("/"));
//           }}
//         >
//           Sign out
//         </button>
//       </p>
//     ) : (
//       <p>You are not logged in.</p>
//     )
// );

class App extends React.Component {
  constructor(props) {
    super(props);
    const cookies = new Cookies();
    this.state = {
      vgt_auth: cookies.get('vgt_auth')
    }

    this.handleRemoveAuthCookie = this.handleRemoveAuthCookie.bind(this);
    this.handleSetAuthCookie = this.handleSetAuthCookie.bind(this);
  }

  handleRemoveAuthCookie(){
    const cookies = new Cookies();
    cookies.remove('vgt_auth');
    this.setState({
      vgt_auth: ""
    })
  }

  handleSetAuthCookie(vgt_auth){
    const cookies = new Cookies();
    cookies.set('vgt_auth',vgt_auth,{ maxAge: 60 * 60 * 24 * 365});
    this.setState({
      vgt_auth: vgt_auth
    })
  }

  render() {
    return (
      <Router>
        <div>
          <PrivateRoute vgt_auth={this.state.vgt_auth} path="/" component={Home} exact handleRemoveAuthCookie={this.handleRemoveAuthCookie} />
          <Route path="/login" render={() => <Login vgt_auth={this.state.vgt_auth} handleSetAuthCookie={this.handleSetAuthCookie}  />} />
        </div>
      </Router>
    );
  }
}

export default App;
