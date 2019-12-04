import { EntityDataModelApi, EntitySetsApi, Models } from 'lattice';

const {
  EntitySetBuilder,
  FullyQualifiedName
} = Models;

const ENTITY_SETS = [
  ['chronicle_study', 'ol.study'],
  ['chronicle_app_data', 'ol.applicationdata'],
  ['chronicle_device', 'ol.device'],
  ['chronicle_recorded_by', 'ol.recordedby'],
  ['chronicle_used_by', 'ol.usedby'],
  ['chronicle_participated_in', 'general.participatedin']
];

const generateEntitySets = () => {

  EntityDataModelApi.getAllEntityTypes()
    .then((entityTypes) => {

      const entityTypeMap = {};
      entityTypes.forEach((entityType) => {
        const fqn = FullyQualifiedName.toString(entityType.type);
        entityTypeMap[fqn] = entityType.id;
      });

      const entitySets = ENTITY_SETS.map((pair) => {
        console.log(pair);
        const name = pair[0];
        const entityTypeId = entityTypeMap[pair[1]];
        if (!entityTypeId) {
          console.log('MAP DOES NOT CONTAIN KEY '.concat(pair[1]));
        }
        return (new EntitySetBuilder())
          .setContacts([])
          .setDescription(name)
          .setEntityTypeId(entityTypeId)
          .setName(name)
          .setTitle(name)
          .build();
      });
      EntitySetsApi.createEntitySets(entitySets);
    });
};

// uncomment to execute
// generateEntitySets();
