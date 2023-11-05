import React, { useEffect, useRef, useState } from 'react';

type Location = {
  lat: number;
  lng: number;
};

const prefectures: Record<string, Location> = {
  "北海道": { lat: 43.0621, lng: 141.3544 },
  "青森県": { lat: 40.8246, lng: 140.7400 },
  "岩手県": { lat: 39.7036, lng: 141.1527 },
  "宮城県": { lat: 38.2688, lng: 140.8721 },
  "秋田県": { lat: 39.7186, lng: 140.1024 },
  "山形県": { lat: 38.2404, lng: 140.3636 },
  "福島県": { lat: 37.7503, lng: 140.4675 },
  "茨城県": { lat: 36.3418, lng: 140.4468 },
  "栃木県": { lat: 36.5657, lng: 139.8835 },
  "群馬県": { lat: 36.3911, lng: 139.0608 },
  "埼玉県": { lat: 35.8574, lng: 139.6489 },
  "千葉県": { lat: 35.6051, lng: 140.1233 },
  "東京都": { lat: 35.6895, lng: 139.6917 },
  "神奈川県": { lat: 35.4475, lng: 139.6425 },
  "新潟県": { lat: 37.9024, lng: 139.0232 },
  "富山県": { lat: 36.6953, lng: 137.2113 },
  "石川県": { lat: 36.5947, lng: 136.6256 },
  "福井県": { lat: 36.0652, lng: 136.2216 },
  "山梨県": { lat: 35.6642, lng: 138.5684 },
  "長野県": { lat: 36.6513, lng: 138.1812 },
  "岐阜県": { lat: 35.3912, lng: 136.7222 },
  "静岡県": { lat: 34.9769, lng: 138.3831 },
  "愛知県": { lat: 35.1802, lng: 136.9066 },
  "三重県": { lat: 34.7303, lng: 136.5086 },
  "滋賀県": { lat: 35.0045, lng: 135.8686 },
  "京都府": { lat: 35.0116, lng: 135.7681 },
  "大阪府": { lat: 34.6863, lng: 135.5200 },
  "兵庫県": { lat: 34.6913, lng: 135.1830 },
  "奈良県": { lat: 34.6851, lng: 135.8050 },
  "和歌山県": { lat: 34.2260, lng: 135.1675 },
  "鳥取県": { lat: 35.5039, lng: 134.2381 },
  "島根県": { lat: 35.4723, lng: 133.0505 },
  "岡山県": { lat: 34.6618, lng: 133.9344 },
  "広島県": { lat: 34.3966, lng: 132.4596 },
  "山口県": { lat: 34.1858, lng: 131.4714 },
  "徳島県": { lat: 34.0658, lng: 134.5593 },
  "香川県": { lat: 34.3401, lng: 134.0434 },
  "愛媛県": { lat: 33.8417, lng: 132.7661 },
  "高知県": { lat: 33.5597, lng: 133.5311 },
  "福岡県": { lat: 33.6066, lng: 130.4183 },
  "佐賀県": { lat: 33.2494, lng: 130.2988 },
  "長崎県": { lat: 32.7448, lng: 129.8737 },
  "熊本県": { lat: 32.7898, lng: 130.7417 },
  "大分県": { lat: 33.2382, lng: 131.6126 },
  "宮崎県": { lat: 31.9111, lng: 131.4239 },
  "鹿児島県": { lat: 31.5602, lng: 130.5581 },
  "沖縄県": { lat: 26.2124, lng: 127.6792 }
};

const GoogleMap: React.FC = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<google.maps.places.PlaceResult[]>([]);
  const [startLocation, setStartLocation] = useState<string | null>(null);
  const [endLocation, setEndLocation] = useState<string | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [distance, setDistance] = useState<string | null>(null); 

  const renderDirections = (result: google.maps.DirectionsResult) => {
    if (directionsRenderer) {
        directionsRenderer.setMap(null);
    }

    const renderer = new google.maps.DirectionsRenderer();
    renderer.setMap(map);
    renderer.setDirections(result);
    setDirectionsRenderer(renderer);
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const initializedMap  = new google.maps.Map(mapRef.current, {
      center: { lat: 35.68238, lng: 139.76556 },
      zoom: 15,
    });

    setMap(initializedMap);
  }, []);

  useEffect(() => {
    if (!map) return;

    if (startLocation && endLocation) {
      const directionsService = new google.maps.DirectionsService();

      directionsService.route({
          origin: prefectures[startLocation],
          destination: prefectures[endLocation],
          travelMode: google.maps.TravelMode.DRIVING,
      }, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
              renderDirections(result);

              const routeDistance = result.routes[0].legs[0].distance.text;
              setDistance(routeDistance);
          } else {
              console.error('Directions request failed due to ' + status);
          }
      });
    }
  
    map.addListener('click', (event) => {
      // 緯度経度の取得
      const latitude = event.latLng.lat();
      const longitude = event.latLng.lng();
      setLocation({ lat: latitude, lng: longitude });

      // 店舗データの取得
      const service = new google.maps.places.PlacesService(map);
      service.nearbySearch({
        location: { lat: latitude, lng: longitude },
        radius: 1000,  // 検索範囲（メートル）
        type: 'store'  // 店舗を検索
      }, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setPlaces(results);
        }
      });
    });
  }, [map, startLocation, endLocation]);

  return (
    <div>
      <div>
        <label>Start Location:</label>
        <select value={startLocation || ''} onChange={(e) => setStartLocation(e.target.value)}>
          <option value="">--Select--</option>
          {Object.keys(prefectures).map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </div>
      <div>
        <label>End Location:</label>
        <select value={endLocation || ''} onChange={(e) => setEndLocation(e.target.value)}>
          <option value="">--Select--</option>
          {Object.keys(prefectures).map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </div>

      <div ref={mapRef} style={{ width: '100%', height: '400px' }} />

      {distance && (
        <div>
          <h2>Route Distance</h2>
          <p>{distance}</p>
        </div>
      )}

      {location && (
        <div>
          <h2>Location</h2>
          <p>Latitude: {location.lat}</p>
          <p>Longitude: {location.lng}</p>
        </div>
      )}
      
      {places.length > 0 && (
        <div>
          <h2>Nearby Stores</h2>
          <ul>
            {places.map((place, index) => (
              <li key={index}>{place.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
      
  )
}

export default GoogleMap;