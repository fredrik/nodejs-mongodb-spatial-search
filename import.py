import sys
import csv
import pymongo


def import_data(csv_file):
  connection = pymongo.Connection()
  db = connection.latlong
  reader = csv.reader(open(csv_file, 'rb'))
  for row in reader:
    try:
      lon, lat, name, city, phone = row
    except ValueError:
      print 'value error: %s' % row
      continue
    lat = float(lat)
    lon = float(lon)
    name = name.strip()
    city = city.split('-')[1]
    category = 'pub'
    
    data = { 'loc': {'lat': lat, 'long': lon}, 'name': name, 'city': city, 'category': category}
    print data
    db.biz.insert(data)
  print "ok"

if __name__ == '__main__':
  if len(sys.argv) < 2:
    print "usage: import.py <csv_file>"
    sys.exit()
  csv_file = sys.argv[1]
  print 'ok, importing %s' % csv_file
  import_data(csv_file)
