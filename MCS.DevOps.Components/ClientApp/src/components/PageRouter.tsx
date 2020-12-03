import * as React from 'react';
import SolutionGrid from './SolutionGrid';
import SolutionImportWR from './SolutionImportWR';

export default function PageRouter() {
    var pageComponentsMapping = new Map<string, JSX.Element>();
    pageComponentsMapping.set("solutionSubGrid.html", < SolutionGrid />);
    pageComponentsMapping.set("solutionImportWR.htm", < SolutionImportWR />);

    const getComponent = (): JSX.Element => {
        var finalComponet: JSX.Element = <h1>Undefined Component</h1>;
        pageComponentsMapping.forEach((component, elem) => {
            console.log(`element  = ${elem} , location ${window.location.href}`);
            if (window.location.href.includes(elem)) {
                console.log(`match found for ${elem}`);
                finalComponet = component;
            }
        });

        return finalComponet
    }

    return (<div>
        {getComponent()}
    </div>
    );
}