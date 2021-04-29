class Geolocation {
  constructor(source, latitude, longitude, accuracy, address) {
    this.source = source;
    this.latitude = latitude;
    this.longitude = longitude;
    this.accuracy = accuracy;
    this.address = address;
  }
}

module.exports = Geolocation
