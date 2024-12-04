exports.getNearbyGymsPage = (req, res) => {
  res.render('nearby-gyms', {
    user: req.user, // 사용자 정보 전달
    title: 'Nearby Gyms', // 페이지 제목
    currentPage: 'Nearby Gyms', // 현재 페이지 이름
    referer: req.headers.referer || null, // 이전 페이지 URL 전달 (없을 경우 null)
  });
};

exports.getNearbyGyms = async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res
      .status(400)
      .json({ error: 'Latitude and Longitude are required.' });
  }

  const apiKey = 'AIzaSyCR_YT9dN3ei0ZBsiui-9UX8Vj6POVYEHQ';
  const radius = 5000;
  const type = 'establishment';
  const keyword =
    'gym OR fitness OR health club OR yoga OR pilates OR personal training OR bodybuilding OR crossfit OR strength training';

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&keyword=${encodeURIComponent(
    keyword
  )}&key=${apiKey}`;

  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      return res.status(500).json({ error: 'Error fetching gyms data' });
    }

    // 상세 정보를 가져오기 위해 place_id를 사용
    const gymsWithDetails = await Promise.all(
      data.results.map(async (gym) => {
        const photoReference =
          gym.photos && gym.photos[0] && gym.photos[0].photo_reference;
        const photoUrl = photoReference
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`
          : null;

        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${gym.place_id}&fields=name,formatted_phone_number&key=${apiKey}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        return {
          ...gym,
          photoUrl,
          phoneNumber:
            detailsData.result && detailsData.result.formatted_phone_number
              ? detailsData.result.formatted_phone_number
              : 'No phone number available',
        };
      })
    );

    res.json(gymsWithDetails);
  } catch (error) {
    console.error('Error fetching gyms:', error);
    res.status(500).send('Error fetching gyms');
  }
};
