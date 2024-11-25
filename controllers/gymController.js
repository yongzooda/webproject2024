// gymController.js
exports.getNearbyGymsPage = (req, res) => {
  // nearby-gyms.ejs 템플릿 렌더링
  res.render('nearby-gyms'); // EJS 파일 이름
};

exports.getNearbyGyms = async (req, res) => {
  console.log('Incoming Request Query:', req.query); // 디버깅용 로그
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    console.error('Missing Latitude or Longitude:', req.query);
    return res
      .status(400)
      .json({ error: 'Latitude and Longitude are required.' });
  }

  console.log('Received Latitude:', lat, 'Received Longitude:', lng);

  const apiKey = 'AIzaSyCR_YT9dN3ei0ZBsiui-9UX8Vj6POVYEHQ'; // Google Places API 키
  const radius = 5000;
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=gym&key=${apiKey}`;

  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(url);
    const data = await response.json();

    console.log('Fetched API Data:', data.results); // 디버깅용 로그
    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ error: 'No gyms found.' });
    }

    res.json(data.results); // 결과 반환
  } catch (error) {
    console.error('Error fetching data from API:', error);
    res.status(500).send('Error fetching gyms');
  }
};
