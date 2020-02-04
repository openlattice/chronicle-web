// @flow

import React from 'react';

import styled from 'styled-components';
import {
  AppContentWrapper,
  Colors,
  Sizes
} from 'lattice-ui-kit';

import SurveyTable from './SurveyTable';

import OpenLatticeIcon from '../../assets/images/ol_icon.png';

const { NEUTRALS, WHITE } = Colors;
const { APP_CONTENT_WIDTH } = Sizes;

const SurveyContainerWrapper = styled.div`
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 0 12px 30px;
  background-color: ${WHITE};

  > img {
    margin-right: 10px;
    height: 26px;
  }

  > h6 {
    font-size: 14px;
    color: ${NEUTRALS[0]};
    font-weight: 600;
    padding: 0;
    margin: 0;
  }
`;

const SurveyTitle = styled.h4`
  color: NEUTRALS[0];
  font-size: 24px;
  font-weight: 400;
  margin: 0 0 20px 0;
  padding: 0;
`;
/* url: participant EKID, studyID
// redirect to chronicle server to get data
// data item: {
//    app_full_name: Facebook
//    id: com.facebook
//    entity_key_id: unique for each app
//
// }
*/

const SurveyContainer = () => {
  return (
    <SurveyContainerWrapper>
      <Header>
        <img src={OpenLatticeIcon} alt="OpenLattice Application Icon" />
        <h6> Chronicle </h6>
      </Header>
      <AppContentWrapper contentWidth={APP_CONTENT_WIDTH}>
        <SurveyTitle>
          Apps Usage Survey
        </SurveyTitle>
        <SurveyTable />
      </AppContentWrapper>
    </SurveyContainerWrapper>
  );
};

export default SurveyContainer;
