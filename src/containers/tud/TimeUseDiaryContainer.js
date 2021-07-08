// @flow

import React, { useEffect, useState } from 'react';

import Cookies from 'js-cookie';
import isEqual from 'lodash/isEqual';
import qs from 'qs';
import { Paged } from 'lattice-fabricate';
import {
  AppContainerWrapper,
  AppContentWrapper,
  // $FlowFixMe
  Box,
  Card,
  CardSegment,
  Spinner,
  Typography,
} from 'lattice-ui-kit';
import { ReduxUtils, useRequestState } from 'lattice-utils';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import ConfirmChangeLanguage from './components/ConfirmChangeLanguage';
import HeaderComponent from './components/HeaderComponent';
import ProgressBar from './components/ProgressBar';
import QuestionnaireForm from './components/QuestionnaireForm';
import SUPPORTED_LANGUAGES from './constants/SupportedLanguages';
import SubmissionErrorModal from './components/SubmissionErrorModal';
import SubmissionSuccessful from './components/SubmissionSuccessful';
import TranslationKeys from './constants/TranslationKeys';
import { SUBMIT_TUD_DATA, VERIFY_TUD_LINK, verifyTudLink } from './TimeUseDiaryActions';
import { PAGE_NUMBERS } from './constants/GeneralConstants';
import { PROPERTY_CONSTS } from './constants/SchemaConstants';
import { usePrevious } from './hooks';
import {
  createFormSchema,
  getIs12HourFormatSelected,
  getIsNightActivityPage,
  getIsSummaryPage,
  selectTimeByPageAndKey
} from './utils';

import * as LanguageCodes from '../../utils/constants/LanguageCodes';
import { DEFAULT_LANGUAGE_COOKIE } from '../../utils/constants/StorageConstants';

const { isPending, isFailure } = ReduxUtils;

const {
  ACTIVITY_END_TIME,
  DAY_END_TIME,
  DAY_START_TIME
} = PROPERTY_CONSTS;

const { DAY_SPAN_PAGE, SURVEY_INTRO_PAGE } = PAGE_NUMBERS;

const TimeUseDiaryContainer = () => {
  const location = useLocation();
  const queryParams = qs.parse(location.search, { ignoreQueryPrefix: true });

  const {
    familyId,
    organizationId,
    participantId,
    studyId,
    waveId,
  } :{
    familyId :string,
    organizationId :UUID,
    participantId :string,
    studyId :UUID,
    waveId :string,
    // $FlowFixMe
  } = queryParams;

  const dispatch = useDispatch();

  const { i18n, t } = useTranslation();

  const initFormSchema = createFormSchema({}, 0, t);

  const [formSchema, setFormSchema] = useState(initFormSchema); // {schema, uiSchema}
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [page, setPage] = useState(0);
  const [formData, setFormData] = useState({});

  const [currentTime, setCurrentTime] = useState();
  const [dayEndTime, setDayEndTime] = useState();
  const [dayStartTime, setDayStartTime] = useState();
  const [isSummaryPage, setIsSummaryPage] = useState(false);
  const [isNightActivityPage, setIsNightActivityPage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [languageToChangeTo, setLanguageToChangeTo] = useState(null);
  const [isChangeLanguageModalVisible, setChangeLanguageModalVisible] = useState(false);
  const [shouldReset, setShouldReset] = useState(false);

  // selectors
  const submitRequestState :?RequestState = useRequestState(['tud', SUBMIT_TUD_DATA]);
  const verifyTudLinkRS :?RequestState = useRequestState(['tud', VERIFY_TUD_LINK]);

  useEffect(() => {
    dispatch(verifyTudLink({
      organizationId,
      studyId,
      participantId
    }));
  }, [dispatch, organizationId, studyId, participantId]);

  useEffect(() => {
    if (submitRequestState === RequestStates.FAILURE) {
      setIsErrorModalVisible(true);
    }
  }, [submitRequestState]);

  // select default language
  useEffect(() => {
    const defaultLngCode = Cookies.get(DEFAULT_LANGUAGE_COOKIE) || LanguageCodes.ENGLISH;

    const defaultLng = SUPPORTED_LANGUAGES.find((lng) => lng.code === defaultLngCode);
    if (defaultLng) {
      setSelectedLanguage({
        label: defaultLng.language,
        value: defaultLng.code
      });
    }
  }, []);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const newSchema = createFormSchema(formData, page, t);
    setFormSchema(newSchema);
  }, [page, selectedLanguage?.value, t]);
  /* eslint-enable */

  const refreshProgress = (currFormData) => {
    const dayStart = selectTimeByPageAndKey(DAY_SPAN_PAGE, DAY_START_TIME, currFormData);
    const dayEnd = selectTimeByPageAndKey(DAY_SPAN_PAGE, DAY_END_TIME, currFormData);
    const currentEnd = selectTimeByPageAndKey(page, ACTIVITY_END_TIME, currFormData);

    setDayStartTime(dayStart);
    setDayEndTime(dayEnd);
    setCurrentTime(currentEnd);
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    refreshProgress(formData);
    setIsSummaryPage(getIsSummaryPage(formData, page));
  }, [page]);
  /* eslint-enable */

  /* eslint-disable react-hooks/exhaustive-deps */
  const prevSchema = usePrevious(formSchema.schema);
  useEffect(() => {
    if (!isEqual(prevSchema, formSchema.schema)) {
      setIsNightActivityPage(getIsNightActivityPage(formSchema.schema, page, t));
    }
  }, [page, formSchema]);
  /* eslint-enable */

  const onPageChange = (currPage, currFormData) => {
    setPage(currPage);
    setFormData(currFormData);
  };

  const changeLanguage = (lng :SelectLanguageOption) => {
    if (lng !== null) {
      i18n.changeLanguage(lng.value);
      Cookies.set(DEFAULT_LANGUAGE_COOKIE, lng.value, {});
      setSelectedLanguage(lng);
    }
  };

  const onConfirmChangeLanguage = () => {
    if (languageToChangeTo !== null) {
      setChangeLanguageModalVisible(false);
      setShouldReset(true);
      changeLanguage(languageToChangeTo);
    }
  };

  const onChangeLanguage = (lng :SelectLanguageOption) => {
    if (lng.value === i18n.language) return;

    if (page === SURVEY_INTRO_PAGE) {
      changeLanguage(lng);
      return;
    }
    setLanguageToChangeTo(lng);
    setChangeLanguageModalVisible(true);
  };

  const updateFormState = (schema, uiSchema, currFormData) => {
    setFormData(currFormData);
    setFormSchema({
      uiSchema,
      schema
    });
  };

  const updateSurveyProgress = (currFormData :Object) => {
    refreshProgress(currFormData);
    setFormData(currFormData);
  };

  const resetSurvey = (goToPage) => {
    goToPage(SURVEY_INTRO_PAGE);
    setFormData({});
    setShouldReset(false);
  };

  const is12hourFormat = getIs12HourFormatSelected(formData);
  const isDayActivityPage = page >= PAGE_NUMBERS.FIRST_ACTIVITY_PAGE
    && !isSummaryPage
    && !isNightActivityPage;

  if (isPending(verifyTudLinkRS)) {
    return (
      <AppContainerWrapper>
        <HeaderComponent onChangeLanguage={onChangeLanguage} selectedLanguage={selectedLanguage} />
        <Box textAlign="center" mt="30px">
          <Spinner size="2x" />
        </Box>
      </AppContainerWrapper>
    );
  }

  if (isFailure(verifyTudLinkRS)) {
    return (
      <AppContainerWrapper>
        <HeaderComponent onChangeLanguage={onChangeLanguage} selectedLanguage={selectedLanguage} />
        <Box textAlign="center" mt="30px">
          <Typography>
            {t(TranslationKeys.ERROR_INVALID_URL)}
          </Typography>
        </Box>
      </AppContainerWrapper>
    );
  }

  return (
    <AppContainerWrapper>
      <HeaderComponent onChangeLanguage={onChangeLanguage} selectedLanguage={selectedLanguage} />
      <AppContentWrapper>
        <ConfirmChangeLanguage
            handleOnClose={() => setChangeLanguageModalVisible(false)}
            handleOnConfirmChange={onConfirmChangeLanguage}
            isVisible={isChangeLanguageModalVisible}
            language={i18n.language}
            trans={t} />
        <SubmissionErrorModal
            handleOnClose={() => setIsErrorModalVisible(false)}
            isVisible={isErrorModalVisible}
            trans={t} />
        {
          submitRequestState === RequestStates.SUCCESS
            ? (
              <SubmissionSuccessful trans={t} />
            )
            : (
              <Card>
                <CardSegment>
                  <ProgressBar
                      currentTime={currentTime}
                      dayEndTime={dayEndTime}
                      dayStartTime={dayStartTime}
                      is12hourFormat={is12hourFormat}
                      isDayActivityPage={isDayActivityPage} />
                  <Paged
                      initialFormData={formData}
                      onPageChange={onPageChange}
                      page={page}
                      render={(pagedProps) => (
                        <QuestionnaireForm
                            familyId={familyId}
                            formSchema={formSchema}
                            initialFormData={formData}
                            isSummaryPage={isSummaryPage}
                            language={i18n.language}
                            organizationId={organizationId}
                            pagedProps={pagedProps}
                            participantId={participantId}
                            resetSurvey={resetSurvey}
                            shouldReset={shouldReset}
                            studyId={studyId}
                            submitRequestState={submitRequestState}
                            trans={t}
                            translationData={i18n.store.data}
                            updateFormState={updateFormState}
                            updateSurveyProgress={updateSurveyProgress}
                            waveId={waveId} />
                      )} />
                </CardSegment>
              </Card>
            )
        }
      </AppContentWrapper>
    </AppContainerWrapper>
  );
};

export default TimeUseDiaryContainer;
