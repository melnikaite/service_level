ServiceLevel = {
  voted: [],
  vote: function (id) {
    if (this.voted.indexOf(id) != -1) return;
    this.voted.push(id);
    fetch('/c/' + this.countrycode + '/l/' + this.langcode + '/p/' + id + '/vote', {method: 'put'});
  },
  loadLevel: function () {
    fetch('/c/' + this.countrycode + '/l/' + this.langcode + '/level').then(function (response) {
      return response.text()
    }).then(function (text) {
      document.body.insertAdjacentHTML('afterbegin', text);
    });
  },
  changeCountry: function (countrycode) {
    window.location.pathname = '/c/' + countrycode + '/l/' + this.langcode
  },
  changeLanguage: function (langcode) {
    window.location.pathname = '/c/' + this.countrycode + '/l/' + langcode
  }
};

document.addEventListener('DOMContentLoaded', function () {
  ServiceLevel.loadLevel();
}, false);
