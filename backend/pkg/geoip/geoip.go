package geoip

import (
	"net"
	"path/filepath"

	"github.com/oschwald/maxminddb-golang"
	"github.com/yorukot/zipt/pkg/logger"
)

// Record represents the record structure for the MaxMind DB
type Record struct {
	Country struct {
		ISOCode string            `maxminddb:"iso_code"`
		Names   map[string]string `maxminddb:"names"`
	} `maxminddb:"country"`
	City struct {
		Names map[string]string `maxminddb:"names"`
	} `maxminddb:"city"`
	Location struct {
		Latitude  float64 `maxminddb:"latitude"`
		Longitude float64 `maxminddb:"longitude"`
	} `maxminddb:"location"`
}

// GeoIP reader instances
var (
	cityDB    *maxminddb.Reader
	countryDB *maxminddb.Reader
)

// Init initializes the GeoIP database readers
func Init() {
	var err error
	cityDBPath := filepath.Join("data", "GeoLite2-City.mmdb")
	countryDBPath := filepath.Join("data", "GeoLite2-Country.mmdb")

	logger.Log.Sugar().Infof("Opening GeoIP City database at: %s", cityDBPath)
	cityDB, err = maxminddb.Open(cityDBPath)
	if err != nil {
		logger.Log.Sugar().Warnf("Could not open GeoIP City database: %v", err)
	} else {
		logger.Log.Sugar().Info("GeoIP City database loaded successfully")
	}

	logger.Log.Sugar().Infof("Opening GeoIP Country database at: %s", countryDBPath)
	countryDB, err = maxminddb.Open(countryDBPath)
	if err != nil {
		logger.Log.Sugar().Warnf("Could not open GeoIP Country database: %v", err)
	} else {
		logger.Log.Sugar().Info("GeoIP Country database loaded successfully")
	}
}

// Close closes the GeoIP database readers
func Close() {
	if cityDB != nil {
		cityDB.Close()
	}
	if countryDB != nil {
		countryDB.Close()
	}
}

// Lookup looks up an IP address in the GeoIP databases
func Lookup(ipAddress string) (country string, city string) {
	if ipAddress == "" {
		return "", ""
	}

	// Parse the IP address
	ip := net.ParseIP(ipAddress)
	if ip == nil {
		return "", ""
	}

	// Try to get country from country database first (more reliable)
	if countryDB != nil {
		var countryRecord struct {
			Country struct {
				ISOCode string            `maxminddb:"iso_code"`
				Names   map[string]string `maxminddb:"names"`
			} `maxminddb:"country"`
		}
		err := countryDB.Lookup(ip, &countryRecord)
		if err == nil && countryRecord.Country.ISOCode != "" {
			country = countryRecord.Country.ISOCode
		}
	}

	// If country not found or city database available, try city database
	if country == "" || cityDB != nil {
		var record Record
		err := cityDB.Lookup(ip, &record)
		if err == nil {
			if country == "" {
				country = record.Country.ISOCode
			}
			if name, ok := record.City.Names["en"]; ok {
				city = name
			}
		}
	}

	return country, city
}
