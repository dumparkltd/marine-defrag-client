/*
 *
 * FeedbackNew
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { actions as formActions } from 'react-redux-form/immutable';
import { Box, Text } from 'grommet';
import {
  getTitleFormField,
  getTextareaField,
} from 'utils/forms';

import { USER_ROLES } from 'themes/config';

import {
  loadEntitiesIfNeeded,
  redirectIfNotPermitted,
  updateEntityForm,
  submitInvalid,
  saveErrorDismiss,
} from 'containers/App/actions';
import {
  selectReady,
  selectReadyForAuthCheck,
} from 'containers/App/selectors';

import Messages from 'components/Messages';
import Loading from 'components/Loading';
import ContentNarrow from 'components/ContentNarrow';
import ContentHeader from 'containers/ContentHeader';

import EntityForm from 'containers/EntityForm';

import { selectDomain } from './selectors';

import messages from './messages';
import { save } from './actions';
import { DEPENDENCIES, FORM_INITIAL } from './constants';

export class FeedbackNew extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
    this.props.initialiseForm('feedbackNew.form.data', FORM_INITIAL);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
    if (nextProps.authReady && !this.props.authReady) {
      this.props.redirectIfNotPermitted();
    }
  }

  getHeaderMainFields = () => {
    const { intl } = this.context;
    return ([ // fieldGroups
      { // fieldGroup
        fields: [
          getTitleFormField(intl.formatMessage, 'title', 'subject', true),
        ],
      },
    ]);
  }

  getBodyMainFields = () => {
    const { intl } = this.context;
    return ([{
      fields: [getTextareaField(
        intl.formatMessage,
        'message_content',
        false,
        'textareaLarge',
        2000,
      )],
    }]);
  };

  render() {
    const { intl } = this.context;
    const { viewDomain, dataReady } = this.props;
    const {
      saveSending,
      saveError,
      submitValid,
      saveSuccess,
    } = viewDomain.get('page').toJS();
    // console.log('saveSuccess', saveSuccess, viewDomain.toJS())
    return (
      <div>
        <Helmet
          title={`${intl.formatMessage(messages.pageTitle)}`}
          meta={[{
            name: 'description',
            content: intl.formatMessage(messages.metaDescription),
          }]}
        />
        <ContentNarrow withoutHeaderNav>
          <ContentHeader
            title={intl.formatMessage(messages.pageTitle)}
          />
          {!saveSuccess && (
            <Box margin={{ bottom: 'large' }}>
              <Text>
                {intl.formatMessage(messages.intro)}
              </Text>
            </Box>
          )}
          {saveSuccess && (
            <Box margin={{ bottom: 'large' }}>
              <Text>
                Success
              </Text>
            </Box>
          )}
          {!submitValid && (
            <Messages
              type="error"
              messageKey="submitInvalid"
              onDismiss={this.props.onErrorDismiss}
            />
          )}
          {saveError && (
            <Messages
              type="error"
              messages={saveError.messages}
              onDismiss={this.props.onServerErrorDismiss}
            />
          )}
          {(saveSending || !dataReady) && <Loading />}
          {dataReady && !saveSuccess && (
            <EntityForm
              model="feedbackNew.form.data"
              formData={viewDomain.getIn(['form', 'data'])}
              saving={saveSending}
              handleSubmit={(formData) => this.props.handleSubmit(formData)}
              handleSubmitFail={this.props.handleSubmitFail}
              handleUpdate={this.props.handleUpdate}
              fields={{
                header: {
                  main: this.getHeaderMainFields(),
                },
                body: {
                  main: this.getBodyMainFields(),
                },
              }}
              labels={{ submit: intl.formatMessage(messages.submit) }}
            />
          )}
          {saveSending && <Loading />}
        </ContentNarrow>
      </div>
    );
  }
}

FeedbackNew.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func.isRequired,
  redirectIfNotPermitted: PropTypes.func,
  handleSubmitFail: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleUpdate: PropTypes.func.isRequired,
  onErrorDismiss: PropTypes.func.isRequired,
  onServerErrorDismiss: PropTypes.func.isRequired,
  viewDomain: PropTypes.object,
  dataReady: PropTypes.bool,
  authReady: PropTypes.bool,
  initialiseForm: PropTypes.func,
};

FeedbackNew.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  viewDomain: selectDomain(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  authReady: selectReadyForAuthCheck(state),
});

function mapDispatchToProps(dispatch) {
  return {
    initialiseForm: (model, formData) => {
      dispatch(formActions.reset(model));
      dispatch(formActions.change(model, formData, { silent: true }));
    },
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    redirectIfNotPermitted: () => {
      dispatch(redirectIfNotPermitted(USER_ROLES.ANALYST.value));
    },
    onErrorDismiss: () => {
      dispatch(submitInvalid(true));
    },
    onServerErrorDismiss: () => {
      dispatch(saveErrorDismiss());
    },
    handleSubmitFail: () => {
      dispatch(submitInvalid(false));
    },
    handleSubmitRemote: (model) => {
      dispatch(formActions.submit(model));
    },
    handleSubmit: (formData) => {
      const data = formData
        .setIn(['attributes', 'content'], formData.getIn(['attributes', 'message_content']))
        .deleteIn(['attributes', 'message_content']);
      dispatch(save(data.toJS()));
    },
    handleUpdate: (formData) => {
      dispatch(updateEntityForm(formData));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackNew);
