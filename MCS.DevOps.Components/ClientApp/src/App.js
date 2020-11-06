import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { Counter } from './components/Counter';
import  SolutionGrid  from './components/SolutionGrid'

import './custom.css'

export default class App extends Component {
  static displayName = App.name;

    render() {

        process.env.REACT_APP_CURRENTAPP = 5;
      return (
          <div>
              <SolutionGrid/>
          </div>
      //<Layout>
      //  <Route exact path='/' component={Home} />
      //      <Route path='/counter' component={Counter} />
      //      <Route path='/fetch-data' component={SolutionGrid} />
      //</Layout>
    );
  }
}
