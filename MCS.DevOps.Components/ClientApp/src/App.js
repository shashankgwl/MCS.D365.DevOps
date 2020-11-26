import React, { Component } from 'react';
import SolutionGrid from './components/SolutionGrid'
import SolutionImportWR from '../src/components/SolutionImportWR'
import './custom.css'

export default class App extends Component {
    static displayName = App.name;

    render() {

        //return (
        //    < CreateSolutionButton />
        //);

        if (window.location.href.includes("solutionSubGrid.html"))
            return (<SolutionGrid />);
        else if (window.location.href.includes("solutionImportWR.htm"))
            return (<SolutionImportWR />)
        else
            return (<h1>unknown COMPONENT</h1>)
    }
}