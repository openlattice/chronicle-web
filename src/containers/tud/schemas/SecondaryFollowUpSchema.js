// @flow

import TranslationKeys from '../constants/TranslationKeys';
import { PROPERTY_CONSTS } from '../constants/SchemaConstants';

const {
  SECONDARY_BOOK_TITLE,
  SECONDARY_BOOK_TYPE,
  SECONDARY_MEDIA_ACTIVITY,
  SECONDARY_MEDIA_AGE,
  SECONDARY_MEDIA_NAME,
} = PROPERTY_CONSTS;

const createSchema = (selectedActivity :string, trans :(string, ?Object) => Object) => {
  const primaryActivities :Object = trans(TranslationKeys.PRIMARY_ACTIVITIES, { returnObjects: true });

  switch (selectedActivity) {
    case primaryActivities.reading: {
      return {
        properties: {
          [SECONDARY_BOOK_TYPE]: {
            type: 'array',
            title: trans(TranslationKeys.BOOK_TYPE),
            description: trans(TranslationKeys.CHOOSE_APPLICABLE),
            items: {
              type: 'string',
              enum: trans(TranslationKeys.BOOK_TYPE_OPTIONS, { returnObjects: true })
            },
            uniqueItems: true,
            minItems: 1
          },
          [SECONDARY_BOOK_TITLE]: {
            type: 'string',
            title: trans(TranslationKeys.BOOK_TITLE)
          }
        },
        required: [SECONDARY_BOOK_TYPE]
      };
    }
    case primaryActivities.media_use:
      return {
        properties: {
          [SECONDARY_MEDIA_ACTIVITY]: {
            title: trans(TranslationKeys.MEDIA_ACTIVITY),
            type: 'array',
            description: trans(TranslationKeys.CHOOSE_APPLICABLE),
            items: {
              enum: trans(TranslationKeys.MEDIA_ACTIVITY_OPTIONS, { returnObjects: true }),
              type: 'string'
            },
            uniqueItems: true,
            minItems: 1
          },
          [SECONDARY_MEDIA_AGE]: {
            title: trans(TranslationKeys.MEDIA_AGE),
            type: 'string',
            enum: trans(TranslationKeys.MEDIA_AGE_OPTIONS, { returnObjects: true })
          },
          [SECONDARY_MEDIA_NAME]: {
            title: trans(TranslationKeys.MEDIA_NAME, { returnObjects: true }),
            type: 'string'
          }
        },
        required: [SECONDARY_MEDIA_ACTIVITY, SECONDARY_MEDIA_AGE]
      };
    default: {
      return {
        properties: {},
        required: []
      };
    }
  }
};

const createUiSchema = (trans :(string, ?Object) => Object) => ({
  [SECONDARY_MEDIA_ACTIVITY]: {
    classNames: 'column-span-12',
    'ui:widget': 'checkboxes',
    'ui:options': {
      withOther: true,
      otherText: trans(TranslationKeys.OTHER)
    }
  },
  [SECONDARY_BOOK_TYPE]: {
    classNames: 'column-span-12',
    'ui:widget': 'checkboxes',
    'ui:options': {
      withOther: true,
      otherText: trans(TranslationKeys.OTHER)
    }
  },
  [SECONDARY_BOOK_TITLE]: {
    classNames: 'column-span-12',
  },
  [SECONDARY_MEDIA_AGE]: {
    classNames: 'column-span-12',
    'ui:widget': 'radio'
  },
  [SECONDARY_MEDIA_NAME]: {
    classNames: 'column-span-12'
  }
});

export {
  createSchema,
  createUiSchema
};
