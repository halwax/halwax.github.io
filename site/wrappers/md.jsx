import React from 'react'
import Helmet from 'react-helmet'
import SiteProject from '../components/SiteProject'
import SitePage from '../components/SitePage'
import { config } from 'config'

class MarkdownWrapper extends React.Component {
    render() {
        const {route} = this.props
        const project = route.page.data
        let layout, template

        layout = project.layout

        if (layout != 'page') {
            template = <SiteProject {...this.props}/>
        } else {
            template = <SitePage {...this.props}/>
        }

        return (
            <div>
              <Helmet title={ `${project.title} - ${config.siteTitle}` }/>
              { template }
            </div>
            );
    }
}

MarkdownWrapper.propTypes = {
    route: React.PropTypes.object,
}

export default MarkdownWrapper
