var sys         = require('sys'),
    path        = require('path'),
    http        = require('http'),
    url         = require('url'),
    querystring = require('querystring'),
    paperboy    = require('paperboy'),
    mongo       = require('mongodb')

var db = new mongo.Db('latlong', new mongo.Server("127.0.0.1", 27017, {}));
db.open(function() {});

var PUBLIC = path.join(path.dirname(__filename), 'public');


// display search fragment.
function display(result) {
  html  = "<div>"
  html += result['name'] + ", " + result['city']
  html += "</div>\n"
  return html;
}

function htmlHeader(query, lat, lon) {
  term = query + " near [" + lat + ", " + lon + "]";
  html  = "<html>\n"
  html += "<head><title>Search results: " + term + "</title></head>\n"
  html += "<body>\n"
  return html;
}

http.createServer(function(req, res) {

  p = url.parse(req.url, true)
  if (p['pathname'] == '/search') {
    
    // error handling.
    if (!p['query'] || !p['query']['q'] || !p['query']['lat'] || !p['query']['lon']) {
      res.writeHead(200, {'content-type': 'text/html'});
      res.write("MISSING INPUTS.")
      res.end()
      return
    }

    // parameters.
    q   = p['query']['q']
    lat = parseFloat(p['query']['lat']) || 0
    lon = parseFloat(p['query']['lon']) || 0
    
    res.writeHead(200, {'content-type': 'text/html'});
    res.write(htmlHeader(q, lat, lon));

    // query mongodb.
    db.collection('biz', function(err, places) {
      if (err) { sys.puts("ERR:" + err) }

      places.find(
        {'name': new RegExp(q, 'i'), loc : { $near : [lat,lon]}},
        {'limit': 10},
        function(err, cursor) { cursor.toArray(function(err, docs) {
          docs.forEach(function(doc) {
            res.write(display(doc));
          });
          res.write("</body></html>\n");
          res.end();
        });
      });
    })
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
