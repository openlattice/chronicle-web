// @flow

import React, { Suspense } from 'react';

import i18n from 'i18next';
import { mount } from 'enzyme';
import { Select } from 'lattice-ui-kit';
import { act } from 'react-dom/test-utils';
// $FlowFixMe
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { Provider } from 'react-redux';
import {
  BrowserRouter,
  Redirect,
  Route,
  Switch
} from 'react-router-dom';

import ConfirmChangeLanguage from './components/ConfirmChangeLanguage';
import QuestionnaireForm from './components/QuestionnaireForm';
import SupportedLanguages from './constants/SupportedLanguages';
import SurveyIntro from './components/SurveyIntro';
import TimeUseDiaryContainer from './TimeUseDiaryContainer';
import TranslationKeys from './constants/TranslationKeys';

import Translations from '../../core/i18n/translations';
import initializeReduxStore from '../../core/redux/ReduxStore';
import initializeRouterHistory from '../../core/router/RouterHistory';
import * as Routes from '../../core/router/Routes';

const resources = {
  en: {
    translation: Translations.en
  }
};

i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    resources
  });

const routerHistory = initializeRouterHistory();
const reduxStore = initializeReduxStore(routerHistory);

const App = (
  <Suspense fallback="...">
    <Provider store={reduxStore}>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <Switch>
            <Route path={Routes.TUD} component={TimeUseDiaryContainer} />
            <Redirect to={Routes.TUD} />
          </Switch>
        </BrowserRouter>
      </I18nextProvider>
    </Provider>
  </Suspense>
);

const testIfMultipleLanguages = (languages) => (languages.length > 1 ? test : test.skip);

const defaultLookup = Translations.en;

describe('TimeUseDiaryContainer', () => {
  test('should pass props to the form component', () => {
    const wrapper = mount(App);
    expect(wrapper.find(QuestionnaireForm).prop('language')).toEqual('en');
  });

  test('translation language should default to English if missing', () => {
    const newLng = { label: 'Test Language', value: 'tl' };
    const wrapper = mount(App);
    act(() => {
      // need this wrapper because action updates state
      wrapper.find(Select).first().prop('onChange')(newLng);
    });
    wrapper.update();
    expect(wrapper.find(Select).first().prop('value')).toStrictEqual(newLng);
    expect(wrapper.find(SurveyIntro).text()).toEqual(Translations.en[TranslationKeys.INTRO_TEXT]);
  });

  test('should render with english translation on launch', () => {
    const wrapper = mount(App);
    expect(wrapper.find(Select).first().prop('value')).toStrictEqual({ label: 'English', value: 'en' });
    // console.log(wrapper.find(QuestionnaireForm).debug());

  });

  testIfMultipleLanguages(SupportedLanguages)(
    'switching languages in the middle of survey should display modal', () => {
      const wrapper = mount(App);

      expect(wrapper.find(ConfirmChangeLanguage).prop('isVisible')).toBeFalsy();

      // go to next page
      wrapper
        .findWhere((n) => n.type() === 'button' && n.text() === defaultLookup[TranslationKeys.BTN_NEXT])
        .simulate('click');

      // should be on page 1
      expect(wrapper.find(QuestionnaireForm).prop('pagedProps').page).toEqual(1);

      // TODO: switch to a language defined in SupportedLanguages
      const newLng = { label: 'Swedish', value: 'sv' };
      expect(SupportedLanguages)
        .toContainEqual(expect.objectContaining({ language: newLng.label, code: newLng.value }));

      // switch language when in page 1
      act(() => {
        wrapper.find(Select).first().prop('onChange')(newLng);
      });
      wrapper.update();
      expect(wrapper.find(ConfirmChangeLanguage).prop('isVisible')).toBeTruthy();

      // click on confirm
      wrapper
        .findWhere((n) => n.type() === 'button' && n.text() === defaultLookup[TranslationKeys.CHANGE_LANGUAGE])
        .simulate('click');

      expect(wrapper.find(ConfirmChangeLanguage).prop('isVisible')).toBeFalsy();
      expect(wrapper.find(QuestionnaireForm).prop('pagedProps').page).toEqual(0);

      const initialFormData = { page0section0: { clockFormat: 12 }, page1section0: {} };
      expect(wrapper.find(QuestionnaireForm).prop('initialFormData')).toStrictEqual(initialFormData);
    }
  );

  test('switching to currently selected language should not show modal', () => {
    const wrapper = mount(App);

    // go to next page
    wrapper
      .findWhere((n) => n.type() === 'button' && n.text() === defaultLookup[TranslationKeys.BTN_NEXT])
      .simulate('click');

    // check current language
    const selectedLanguage = { value: 'en', label: 'English' };
    expect(wrapper.find(Select).first().prop('value')).toStrictEqual(selectedLanguage);

    // should be on page 1
    expect(wrapper.find(QuestionnaireForm).prop('pagedProps').page).toEqual(1);
    act(() => {
      wrapper.find(Select).first().prop('onChange')(selectedLanguage);
    });

    // after selecting same language, should still be on page 1
    expect(wrapper.find(QuestionnaireForm).prop('pagedProps').page).toEqual(1);
    expect(wrapper.find(ConfirmChangeLanguage).prop('isVisible')).toBeFalsy();
  });
});
