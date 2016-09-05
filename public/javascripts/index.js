ServiceLevel = {
  voted: [],
  vote: function (id) {
    if (this.voted.indexOf(id) != -1) return;
    this.voted.push(id);
    fetch('/p/' + id + '/vote', {method: 'put'});
  }
};
