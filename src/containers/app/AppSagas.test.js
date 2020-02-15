// @flow
import {
  INITIALIZE_APPLICATION,
} from './AppActions';
import {
  initializeApplicationWatcher,
  initializeApplicationWorker,
} from './AppSagas';

import {
  testShouldBeGeneratorFunction,
  testWatcherSagaShouldTakeEvery,
} from '../../utils/testing/TestUtils';

describe('AppSagas', () => {

  /*
   *
   * AppActions.initializeApplication
   *
   */

  describe('initializeApplicationWatcher', () => {
    testShouldBeGeneratorFunction(initializeApplicationWatcher);
    testWatcherSagaShouldTakeEvery(
      initializeApplicationWatcher,
      initializeApplicationWorker,
      INITIALIZE_APPLICATION
    );
  });

});
