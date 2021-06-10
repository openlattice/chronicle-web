// @flow

import React, { useState } from 'react';

import { List } from 'immutable';
// $FlowFixMe
import { Button, Menu, MenuItem } from 'lattice-ui-kit';
import { ReduxUtils } from 'lattice-utils';
import type { RequestState } from 'redux-reqseq';

import DataTypes from '../constants/DataTypes';
import type { DataType } from '../constants/DataTypes';

const { isPending } = ReduxUtils;

// actions
const DOWNLOAD_DATA = 'downloadData';
const TOGGLE_MENU = 'toggleMenu';

type Props = {
  onDownloadData :(entity :?List, date :?string, dataType :DataType) => void;
  downloadAllDataRS :?RequestState;
}
const DownloadAllButton = ({ downloadAllDataRS, onDownloadData } :Props) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    const { currentTarget } = event;
    const { dataset } = currentTarget;
    const { actionId, typeId } = dataset;

    switch (actionId) {
      case TOGGLE_MENU:
        setAnchorEl(currentTarget);
        break;
      case DOWNLOAD_DATA:
        handleClose();
        onDownloadData(undefined, undefined, typeId);
        break;
      default:
    }
  };

  return (
    <div>
      <Button
          aria-controls="menu"
          aria-haspopup="true"
          color="primary"
          data-action-id={TOGGLE_MENU}
          isLoading={isPending(downloadAllDataRS)}
          onClick={handleClick}
          size="small">
        Download All
      </Button>
      <Menu
          id="menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}>
        <MenuItem
            data-action-id={DOWNLOAD_DATA}
            data-type-id={DataTypes.DAYTIME}
            onClick={handleClick}>
          Daytime
        </MenuItem>
        <MenuItem
            data-action-id={DOWNLOAD_DATA}
            data-type-id={DataTypes.NIGHTTIME}
            onClick={handleClick}>
          Nighttime
        </MenuItem>

        <MenuItem
            data-action-id={DOWNLOAD_DATA}
            data-type-id={DataTypes.SUMMARIZED}
            onClick={handleClick}>
          Summarized
        </MenuItem>
      </Menu>
    </div>
  );
};

export default DownloadAllButton;
