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

http.createServer(function(req, res) {

  p = url.parse(req.url, true)

  if (p['pathname'] == '/search') {
    if (!p['query'] || !p['query']['q'] || !p['query']['lat'] || !p['query']['lon']) {
      res.writeHead(200, {'content-type': 'text/html'});
      res.write("MISSING INPUTS.")
      res.end()
      return
    }
    q   = p['query']['q']
    lat = parseFloat(p['query']['lat']) || 0
    lon = parseFloat(p['query']['lon']) || 0
    
    res.writeHead(200, {'content-type': 'text/html'});
    res.write("<html><body>\n");

    // query mongodb.
    db.collection('biz', function(err, places) {
      if (err) {
        sys.puts("ERR:" + err)
      }
      //sys.puts("ERR: " + err);
      //sys.puts(new Error().stack)
      //sys.puts(sys.inspect(places));
      if (places) {
        places.find({'name': new RegExp(q), loc : { $near : [lat,lon]}}, {'limit': 10}, function(err, cursor) {
         sys.puts("I'M IN A CALLBACK?!")
         sys.puts(sys.inspect(cursor))
         cursor.toArray(function(err, docs) {
           sys.puts("Printing docs from Array")
           docs.forEach(function(doc) {
             res.write(display(doc));
             sys.puts("Doc from Array " + sys.inspect(doc));
           });
           sys.puts("ok, done.")
           res.write("</body></html>\n")
           res.end();
         });
        })
      } else {
        sys.puts("not places. err: " + err)
      }
    })

    sys.puts('what?')
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
