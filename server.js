var sys         = require('sys'),
    path        = require('path'),
    http        = require('http'),
    url         = require('url'),
    querystring = require('querystring'),
    paperboy    = require('paperboy');

var PUBLIC = path.join(path.dirname(__filename), 'public');

// display search fragment.
function display(result) {
  html  = "<div>"
  html += "pavement."
  html += "</div>"
  return html;
}

http.createServer(function(req, res) {

  p = url.parse(req.url, true)
  if (p['pathname'] == '/search') {
    q   = p['query']['q']
    lat = p['query']['lat']
    lon = p['query']['lon']
    
    // query mongodb.
    results = ["o", "a", "e"]
    
    res.writeHead(200, {'content-type': 'text/html'});
    res.write("<html><body>");
    for (result in results) {
      res.write(display(result));
    }
    res.write("</body></html>");
    res.end();
    return
  }

  // let paperboy handle any static content.
  paperboy
    .deliver(PUBLIC, req, res)
    .after(function(statCode) {
      sys.log('Served Request: ' + statCode + ' ' + req.url)
    })
    .otherwise(function() {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.write('Not Found');
      res.end();
    });

}).listen(8000, '127.0.0.1');

sys.log('ready at http://localhost:8000/')
