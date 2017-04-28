import { connect } from 'react-redux';
import Status from '../components/status';
import { makeGetStatus } from '../selectors';
import {
  replyCompose,
  mentionCompose
} from '../actions/compose';
import {
  reblog,
  favourite,
  unreblog,
  unfavourite
} from '../actions/interactions';
import {
  blockAccount,
  muteAccount
} from '../actions/accounts';
import { deleteStatus } from '../actions/statuses';
import { initReport } from '../actions/reports';
import { openModal } from '../actions/modal';
import { createSelector } from 'reselect'
import { isMobile } from '../is_mobile'
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

const messages = defineMessages({
  deleteConfirm: { id: 'confirmations.delete.confirm', defaultMessage: 'Delete' },
  deleteMessage: { id: 'confirmations.delete.message', defaultMessage: 'Are you sure you want to delete this status?' },
  blockConfirm: { id: 'confirmations.block.confirm', defaultMessage: 'Block' },
  muteConfirm: { id: 'confirmations.mute.confirm', defaultMessage: 'Mute' },
});

const makeMapStateToProps = () => {
  const getStatus = makeGetStatus();

  const mapStateToProps = (state, props) => ({
    status: getStatus(state, props.id),
    me: state.getIn(['meta', 'me']),
    boostModal: state.getIn(['meta', 'boost_modal']),
    autoPlayGif: state.getIn(['meta', 'auto_play_gif'])
  });

  return mapStateToProps;
};

const mapDispatchToProps = (dispatch, { intl }) => ({

  onReply (status, router) {
    dispatch(replyCompose(status, router));
  },

  onModalReblog (status) {
    dispatch(reblog(status));
  },

  onReblog (status, e) {
    if (status.get('reblogged')) {
      dispatch(unreblog(status));
      if (state.getIn(['meta', 'piwik_enabled']) == 'true') {
        _paq.push(['trackEvent', 'Statuses', 'Unreblog']);
      }
    } else {
      if (e.shiftKey || !this.boostModal) {
        this.onModalReblog(status);
      } else {
        dispatch(openModal('BOOST', { status, onReblog: this.onModalReblog }));
      }
      if (state.getIn(['meta', 'piwik_enabled']) == 'true') {
        _paq.push(['trackEvent', 'Statuses', 'Reblog']);
      }
    }
  },

  onFavourite (status) {
    if (status.get('favourited')) {
      dispatch(unfavourite(status));
      if (state.getIn(['meta', 'piwik_enabled']) == 'true') {
        _paq.push(['trackEvent', 'Statuses', 'UnFav']);
      }
    } else {
      dispatch(favourite(status));
      if (state.getIn(['meta', 'piwik_enabled']) == 'true') {
        _paq.push(['trackEvent', 'Statuses', 'Fav']);
      }
    }
  },

  onDelete (status) {
    if (state.getIn(['meta', 'piwik_enabled']) == 'true') {
      _paq.push(['trackEvent', 'Statuses', 'Delete']);
    }
    dispatch(openModal('CONFIRM', {
      message: intl.formatMessage(messages.deleteMessage),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () => dispatch(deleteStatus(status.get('id')))
    }));
  },

  onMention (account, router) {
    dispatch(mentionCompose(account, router));
    if (state.getIn(['meta', 'piwik_enabled']) == 'true') {
      _paq.push(['trackEvent', 'Statuses', 'Mention']);
    }
  },

  onOpenMedia (media, index) {
    dispatch(openModal('MEDIA', { media, index }));
  },

  onOpenVideo (media, time) {
    dispatch(openModal('VIDEO', { media, time }));
  },

  onBlock (account) {
    dispatch(openModal('CONFIRM', {
      message: <FormattedMessage id='confirmations.block.message' defaultMessage='Are you sure you want to block {name}?' values={{ name: <strong>@{account.get('acct')}</strong> }} />,
      confirm: intl.formatMessage(messages.blockConfirm),
      onConfirm: () => dispatch(blockAccount(account.get('id')))
    }));
  },

  onReport (status) {
    dispatch(initReport(status.get('account'), status));
    if (state.getIn(['meta', 'piwik_enabled']) == 'true') {
      _paq.push(['trackEvent', 'Statuses', 'Report']);
    }
  },

  onMute (account) {
    dispatch(openModal('CONFIRM', {
      message: <FormattedMessage id='confirmations.mute.message' defaultMessage='Are you sure you want to mute {name}?' values={{ name: <strong>@{account.get('acct')}</strong> }} />,
      confirm: intl.formatMessage(messages.muteConfirm),
      onConfirm: () => dispatch(muteAccount(account.get('id')))
    }));
  },

});

export default injectIntl(connect(makeMapStateToProps, mapDispatchToProps)(Status));
