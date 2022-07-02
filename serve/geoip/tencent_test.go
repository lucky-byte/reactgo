package geoip

import "testing"

func TestTencent(t *testing.T) {
	info, err := TencentLookup("223.104.214.144", "ZLRBZ-F6RKX-C534M-TQDPD-BE4GZ-D3FNP")
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("info: %v", info)

	info, err = TencentLookup("114.247.50.2", "ZLRBZ-F6RKX-C534M-TQDPD-BE4GZ-D3FNP")
	if err != nil {
		t.Fatal(err)
	}
	t.Logf("info: %v", info)
}
