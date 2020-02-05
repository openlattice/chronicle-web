// @flow

import React from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Button,
  Card,
  CardSegment,
  Table,
  StyleUtils
} from 'lattice-ui-kit';

import TABLE_HEADERS from './utils/TableHeaders';
import TableRow from './components/TableRow';

const { media } = StyleUtils;

const SubmitButtonWrapper = styled.div`
  margin-top: 20px;
  text-align: end;
`;

const StyledCard = styled(Card)`
  ${media.phone`
    padding: 10px;
  `}
`;

const StyledCardSegment = styled(CardSegment)`
  ${media.phone`
    margin: 0 10px 0 10px;
  `}
`;

const NoAppsFound = styled.h4`
  font-weight: 400;
  font-size: 15px;
  text-align: center;
`;

type Props = {
  userApps :Map;
}

const SurveyTable = ({ userApps } :Props) => {
  const handleOnSubmit = () => {
    // to do
  };

  const components = {
    Row: ({ data: rowData } :any) => (
      <TableRow data={rowData} />
    )
  };

  return (
    <StyledCard>
      <StyledCardSegment vertical noBleed>
        {
          userApps.isEmpty()
            ? (
              <NoAppsFound>
                No apps found. Please try refreshing the page.
              </NoAppsFound>
            )
            : (
              <>
                <Table
                    data={userApps.valueSeq().toJS()}
                    components={components}
                    headers={TABLE_HEADERS} />

                <SubmitButtonWrapper>
                  <Button
                      mode="primary"
                      onClick={handleOnSubmit}>
                      Submit Survey
                  </Button>
                </SubmitButtonWrapper>
              </>
            )
        }

      </StyledCardSegment>
    </StyledCard>
  );
};

export default SurveyTable;
