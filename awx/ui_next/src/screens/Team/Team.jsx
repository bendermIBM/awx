import React, { Component } from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import { Switch, Route, withRouter, Redirect, Link } from 'react-router-dom';
import { Card, PageSection } from '@patternfly/react-core';
import CardCloseButton from '@components/CardCloseButton';
import { TabbedCardHeader } from '@components/Card';
import RoutedTabs from '@components/RoutedTabs';
import ContentError from '@components/ContentError';
import TeamDetail from './TeamDetail';
import TeamEdit from './TeamEdit';
import { TeamsAPI } from '@api';

class Team extends Component {
  constructor(props) {
    super(props);

    this.state = {
      team: null,
      hasContentLoading: true,
      contentError: null,
      isInitialized: false,
    };
    this.loadTeam = this.loadTeam.bind(this);
  }

  async componentDidMount() {
    await this.loadTeam();
    this.setState({ isInitialized: true });
  }

  async componentDidUpdate(prevProps) {
    const { location, match } = this.props;
    const url = `/teams/${match.params.id}/`;

    if (
      prevProps.location.pathname.startsWith(url) &&
      prevProps.location !== location &&
      location.pathname === `${url}details`
    ) {
      await this.loadTeam();
    }
  }

  async loadTeam() {
    const { match, setBreadcrumb } = this.props;
    const id = parseInt(match.params.id, 10);

    this.setState({ contentError: null, hasContentLoading: true });
    try {
      const { data } = await TeamsAPI.readDetail(id);
      setBreadcrumb(data);
      this.setState({ team: data });
    } catch (err) {
      this.setState({ contentError: err });
    } finally {
      this.setState({ hasContentLoading: false });
    }
  }

  render() {
    const { location, match, i18n } = this.props;

    const { team, contentError, hasContentLoading, isInitialized } = this.state;

    const tabsArray = [
      { name: i18n._(t`Details`), link: `${match.url}/details`, id: 0 },
      { name: i18n._(t`Users`), link: `${match.url}/users`, id: 1 },
      { name: i18n._(t`Access`), link: `${match.url}/access`, id: 2 },
    ];

    let cardHeader = (
      <TabbedCardHeader>
        <RoutedTabs tabsArray={tabsArray} />
        <CardCloseButton linkTo="/teams" />
      </TabbedCardHeader>
    );

    if (!isInitialized) {
      cardHeader = null;
    }

    if (location.pathname.endsWith('edit')) {
      cardHeader = null;
    }

    if (!hasContentLoading && contentError) {
      return (
        <PageSection>
          <Card className="awx-c-card">
            <ContentError error={contentError}>
              {contentError.response.status === 404 && (
                <span>
                  {i18n._(`Team not found.`)}{' '}
                  <Link to="/teams">{i18n._(`View all Teams.`)}</Link>
                </span>
              )}
            </ContentError>
          </Card>
        </PageSection>
      );
    }

    return (
      <PageSection>
        <Card className="awx-c-card">
          {cardHeader}
          <Switch>
            <Redirect from="/teams/:id" to="/teams/:id/details" exact />
            {team && (
              <Route
                path="/teams/:id/edit"
                render={() => <TeamEdit team={team} />}
              />
            )}
            {team && (
              <Route
                path="/teams/:id/details"
                render={() => <TeamDetail team={team} />}
              />
            )}
            {team && (
              <Route
                path="/teams/:id/users"
                render={() => <span>Coming soon :)</span>}
              />
            )}
            {team && (
              <Route
                path="/teams/:id/access"
                render={() => <span>Coming soon :)</span>}
              />
            )}
            <Route
              key="not-found"
              path="*"
              render={() =>
                !hasContentLoading && (
                  <ContentError isNotFound>
                    {match.params.id && (
                      <Link to={`/teams/${match.params.id}/details`}>
                        {i18n._(`View Team Details`)}
                      </Link>
                    )}
                  </ContentError>
                )
              }
            />
            ,
          </Switch>
        </Card>
      </PageSection>
    );
  }
}

export default withI18n()(withRouter(Team));
export { Team as _Team };
