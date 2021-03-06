const Sequelize = require('sequelize');

const database = require('./database');

const LinkProject = require('./LinkProject.model');

const Op = Sequelize.Op;

// create link model
const Link = database.define('link', {
  description: {
    type: Sequelize.STRING,
  },
  name: {
    type: Sequelize.STRING,
  },
  url: {
    type: Sequelize.STRING,
  },
  userId: {
    type: Sequelize.STRING,
  },
});

// create table with link model
Link.sync()
  .then(() => console.log('Link table created successfully'))
  .catch(err => console.log('oooh, did you enter wrong database credentials?'));

Link.createLink = async ({ description, name, projectId, url, userId }) => {
  const link = await Link.create({
    description,
    name,
    url,
    userId
  });

  if (projectId) {
    await LinkProject.create({ linkId: link.id, projectId });
  }
  return link;
};

Link.linkToProject = async ({ linkId, projectId }) => {
  return await LinkProject.create({ linkId, projectId });
};

Link.unlinkFromProject = async ({ linkId, projectId }) => {
  return await LinkProject.destroy({
    where: { linkId, projectId },
  });
};

Link.updateLink = async ({ id, userId, ...rest }) => {
  await Link.update({ ...rest }, {
    where: { id, userId },
  });
  const Links = await Link.findAll({
    where: {
      userId,
      id: {
        [Op.in]: [id],
      },
    },
  });

  return Links[0];
};

Link.getLinksByProject = async ({ id, userId }) => {
  const linkProjects = await LinkProject.findAll({
    where: { projectId: id },
  });
  const linkIds = linkProjects.map(value => {
    return value.linkId;
  });
  return await Link.findAll({
    where: { id: linkIds, userId },
  });
};

Link.getLinksByUser = async (userId, {exclude, ids}) => {
  let whereStatement = {
    userId,
  };

  if(exclude) {
    whereStatement.id = {
      [Op.notIn]: exclude,
    };
  }

  if(ids) {
    whereStatement.id = {
      [Op.in]: ids,
    };
  }
  
  return await Link.findAll({
    where: whereStatement,
  });
};

Link.getAllLinks = async () => {
  return await Link.findAll();
};

Link.getLink = async ({ id, userId }) => {
  return await Link.findOne({
    where: { id, userId },
  });
};

Link.deleteLink = async ({ id, userId }) => {
  await Link.destroy({
    where: { id, userId },
  });

  await LinkProject.destroy({
    where: { linkId: id },
  });

  return id;
};

module.exports = Link;
