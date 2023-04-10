module.exports =  function(req, res) {
    let userName = "";
    res.render('home.html', { title: 'My Candy Shop',userName });
 };

 