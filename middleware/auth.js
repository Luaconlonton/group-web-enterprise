exports.isAdmin = function(req, res, next) {
    if (req.session && req.session.admin)
      return next();
    else
      return res.sendStatus(401);
};

exports.isStaff = function(req, res, next) {
    if (req.session && req.session.staff)
      return next();
    else
      return res.sendStatus(401);
};

exports.isQAM = function(req, res, next) {
    if (req.session && req.session.qam)
      return next();
    else
      return res.sendStatus(401);
};

exports.isQAC = function(req, res, next) {
  if (req.session && req.session.qac)
    return next();
  else
    return res.sendStatus(401);
};