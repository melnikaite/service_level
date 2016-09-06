var express = require('express');
var router = express.Router();
var models = require('../models');
var reCAPTCHA = require('recaptcha2');
var recaptcha = new reCAPTCHA({
  siteKey: '6LcrYykTAAAAALUnC_D2XQaQYK0gU-9mZzvpYZsD',
  secretKey: '6LcrYykTAAAAAMHDDoVXUEZ6_l6nWo8T3t-es9T1'
});
var sanitizeHtml = require('sanitize-html');

var calculateServiceLevel = function (results) {
  var serviceLevel = {total: 0};
  results.forEach(function (result) {
    serviceLevel[result._id] = result.count;
    if ([0, 1].indexOf(result._id) != -1) {
      serviceLevel['total'] += result.count;
    }
  });
  return {
    positive: serviceLevel[1] * 100 / serviceLevel['total'],
    negative: serviceLevel[0] * 100 / serviceLevel['total']
  }
};

var renderPostsSortedBy = function (req, res, next, field, direction) {
  var sort = {};
  sort[field] = direction;
  models.post.find({country: req.params.country, language: req.params.language})
    .sort(sort).skip(req.params.skip).limit(5)
    .exec(function (err, posts) {
      if (err) return next(err);
      models.post.aggregate({$group: {_id: '$country', count: {'$sum': 1}}}, function (err, results) {
        if (err) return next(err);
        var serviceLevel = calculateServiceLevel(results);
        res.render('index', {title: 'Service Level', posts: posts, serviceLevel: serviceLevel});
      });
    });
};

router.get('/', function (req, res, next) {
  res.redirect('/c/1/l/1');
});

router.get('/c/:country/l/:language', function (req, res, next) {
  renderPostsSortedBy(req, res, next, 'created_at', 1);
});

router.get('/c/:country/l/:language/popular', function (req, res, next) {
  renderPostsSortedBy(req, res, next, 'upvotes', 1);
});

router.get('/p/:id', function (req, res, next) {
  models.post.findOne({_id: req.params.id}, function (err, post) {
    if (err) return next(err);
    res.render('show', {title: 'Service Level', post: post});
  });
});

router.put('/p/:id/vote', function (req, res, next) {
  models.post.update({_id: req.params.id}, {$inc: {upvotes: 1}}, function (err) {
    if (err) return next(err);
    res.send('OK');
  });
});

router.get('/new', function (req, res, next) {
  res.render('new', {title: 'Service Level'});
});

router.post('/create', function (req, res, next) {
  recaptcha.validateRequest(req)
    .then(function () {
      console.log(req.body);
      models.post.create({
        positive: !!req.body.positive,
        text: sanitizeHtml(req.body.text),
        country: req.body.country,
        language: req.body.language
      }, function (err, post) {
        if (err) return next(err);
        res.redirect('/p/' + post.id);
      });
    })
    .catch(function (errorCodes) {
      next(recaptcha.translateErrors(errorCodes));
    });
});

module.exports = router;
