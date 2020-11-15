import React, { Component } from 'react';
import SolutionGrid from './components/SolutionGrid'
import SolutionImportWR from '../src/components/SolutionImportWR'
import AuthCheck from '../src/components/AuthCheck'
import './custom.css'

export default class App extends Component {
    static displayName = App.name;

    render() {

        //return(
        //    < SolutionImportWR />
        //);

        if (window.location.href.includes("solutionSubGrid.html"))
            return (<SolutionGrid />);
        else if (window.location.href.includes("solutionImportWR.htm"))
            return (<SolutionImportWR />)
        else
            return (<AuthCheck />)
    }
}
