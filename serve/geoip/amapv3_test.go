package geoip

import "testing"

func TestAmapV3(t *testing.T) {
	info, err := AMapLookupV3("223.104.214.144", "082bfe3c23cd9768062feeebe2ea7d01")
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("info: %v", info)

	info, err = AMapLookupV3("114.247.50.2", "082bfe3c23cd9768062feeebe2ea7d01")
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("info: %v", info)
}
