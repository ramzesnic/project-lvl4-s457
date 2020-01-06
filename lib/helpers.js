const formatedDate = (context) => {
  const date = new Date(context.createdAt);
  return date.toLocaleString();
};

const getTagsArray = tagsStr => tagsStr.split(';')
  .map(tag => tag.trim())
  .filter(tag => tag !== '');

const getTagsObject = tagsArray => tagsArray.map(tag => ({ name: tag }));

const getStatusesData = statuses => statuses.map(status => ({ name: status.name, id: status.id }));

const getExecutorsData = executors => executors
  .map(executor => ({ name: executor.fullName, id: executor.id }));

export {
  formatedDate, getTagsArray, getTagsObject, getStatusesData, getExecutorsData,
};
