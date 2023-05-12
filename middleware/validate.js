module.exports = validator => {
    return async (req, res, next) => {
      validator(req.body)
        .then(() => next())
        .catch(e => {
          error = {
            property: e.path,
            message: e.message,
          };
          return res.status(400).send(error);
        });
    };
  };
  