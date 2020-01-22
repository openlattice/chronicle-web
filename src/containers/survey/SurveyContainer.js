// @flow

import React from 'react';

import styled from 'styled-components';

import SurveyTable from './SurveyTable';

// todo: set responsive widths
const SurveyContainerWrapper = styled.div`
  // width: 500px;
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
      <SurveyTable />
    </SurveyContainerWrapper>
  );
};

export default SurveyContainer;
