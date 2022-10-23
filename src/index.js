import { StrictMode } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import "./styles.css";
import App from "./App";
import Login from "./Login";
import Authorize from "./Authorize";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <Router>
    <div>
      <Switch>
        <Route path="/authorize">
          <Authorize />
        </Route>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/">
          <App />
        </Route>
      </Switch>
    </div>
  </Router>,
  rootElement
);
