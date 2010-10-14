import sys
import csv
import pymongo


def import_data(csv_file):
  connection = pymongo.Connection()
  db = connection.latlong
  reader = csv.reader(open(csv_file, 'rb'))
  for row in reader:
    lat, lon, name, phone_address = row
    lat = float(lat)
    lon = float(lon)
    phone_address = map(lambda s: s.strip(), phone_address.split(';'))
    phone, address = phone_address[0:2]
    print { 'loc': {'lat': lat, 'long': lon}, 'name': name, 'address': address}
    db.biz.insert({ 'loc': {'lat': lat, 'long': lon}, 'name': name, 'address': address})
  print "ok"

if __name__ == '__main__':
  if len(sys.argv) < 2:
    print "usage: import.py <csv_file>"
    sys.exit()
  csv_file = sys.argv[1]
  print 'ok, importing %s' % csv_file
  import_data(csv_file)
