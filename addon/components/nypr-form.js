import Component from 'ember-component';
import layout from '../templates/components/nypr-form';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import RSVP from 'rsvp';

export default Component.extend({
  layout,

  // pass these in
  changeset: null,
  allowedKeys: [],
  onSubmit: () => {},
  onFailure: () => {},
  onSuccess: () => {},
  onInvalid: () => {},

  // yields these
  tried: false,
  success: false,
  failure: false,
  invalid: false,
  processing: false,
  actions: {
    submit() {
      set(this, 'tried', true);
      set(this, 'processing', true);
      let changeset = get(this, 'changeset');
      let snapshot = changeset.snapshot();
      return changeset.cast(get(this, 'allowedKeys'))
      .validate()
      .then(() => {
        if(get(changeset, 'isValid')) {
          changeset.execute();
          RSVP.Promise.resolve(get(this, 'onSubmit')())
          .then(() => {
            set(this, 'success', true);
            get(this, 'onSuccess')();
            set(this, 'processing', false);
          })
          .catch(e => {
            changeset.restore(snapshot);
            set(this, 'failure', true);
            get(this, 'onFailure')(e);
            set(this, 'processing', false);
          });
        } else {
          changeset.restore(snapshot);
          set(this, 'invalid', true);
          get(this, 'onInvalid')();
          set(this, 'processing', false);
        }
      });
    }
  }
});
