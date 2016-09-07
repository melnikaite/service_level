var express = require('express');
var router = express.Router();
var models = require('../models');
var reCAPTCHA = require('recaptcha2');
var recaptcha = new reCAPTCHA({
  siteKey: '6LcrYykTAAAAALUnC_D2XQaQYK0gU-9mZzvpYZsD',
  secretKey: '6LcrYykTAAAAAMHDDoVXUEZ6_l6nWo8T3t-es9T1'
});
var sanitizeHtml = require('sanitize-html');
var languages = require('languages');
var countries = require('countries-list').countries;

var renderPostsSortedBy = function (req, res, next, field, direction) {
  var sort = {};
  sort[field] = direction;
  models.post.find({country: req.params.country, language: req.params.language})
    .sort(sort).skip(req.params.skip).limit(100)
    .exec(function (err, posts) {
      if (err) return next(err);
      res.render('index', {
        title: 'Service Level',
        posts: posts,
        countries: countries,
        languages: languages,
        params: req.params
      });
    });
};

router.get('/', function (req, res, next) {
  res.redirect('/c/BY/l/ru');
});

router.get('/c/:country/l/:language', function (req, res, next) {
  renderPostsSortedBy(req, res, next, 'created_at', -1);
});

router.get('/c/:country/l/:language/popular', function (req, res, next) {
  renderPostsSortedBy(req, res, next, 'upvotes', -1);
});

router.get('/c/:country/l/:language/p/:id', function (req, res, next) {
  models.post.findOne({_id: req.params.id}, function (err, post) {
    if (err) return next(err);
    res.render('show', {
      title: 'Service Level',
      post: post,
      countries: countries,
      languages: languages,
      params: req.params
    });
  });
});

router.put('/c/:country/l/:language/p/:id/vote', function (req, res, next) {
  models.post.update({_id: req.params.id}, {$inc: {upvotes: 1}}, function (err) {
    if (err) return next(err);
    res.send('OK');
  });
});

router.get('/c/:country/l/:language/new', function (req, res, next) {
  res.render('new', {
    title: 'Service Level',
    countries: countries,
    languages: languages,
    params: req.params,
    recaptcha: recaptcha
  });
});

router.post('/c/:country/l/:language/create', function (req, res, next) {
  recaptcha.validateRequest(req)
    .then(function () {
      models.post.create({
        positive: req.body.positive,
        text: sanitizeHtml(req.body.text),
        country: req.params.country,
        language: req.params.language,
        created_at: new Date()
      }, function (err, post) {
        if (err) return next(err);
        res.redirect('/c/' + post.country + '/l/' + post.language + '/p/' + post.id);
      });
    })
    .catch(function (errorCodes) {
      next(recaptcha.translateErrors(errorCodes));
    });
});

router.get('/c/:country/l/:language/level', function (req, res, next) {
  models.post.aggregate([{$match: {country: req.params.country}}, {
    $group: {
      _id: '$positive',
      count: {'$sum': 1}
    }
  }], function (err, results) {
    if (err) return next(err);

    var serviceLevel = {total: 0};
    results.forEach(function (result) {
      serviceLevel[result._id] = result.count;
      serviceLevel['total'] += result.count;
    });

    res.render('service-level', {
      positive: (serviceLevel[true] || 0) * 100 / serviceLevel['total'],
      negative: (serviceLevel[false] || 0) * 100 / serviceLevel['total']
    });
  });
});

module.exports = router;
