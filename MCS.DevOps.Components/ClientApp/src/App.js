import React, { Component } from 'react';
import PageRouter  from './components/PageRouter'

export default class App extends Component {
    static displayName = App.name;

    render() {

        return (
            <PageRouter />
        );
    }
}