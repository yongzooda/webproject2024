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
  const radius = 5000; // 검색 반경을 확장
  const type = 'establishment'; // 다양한 유형 포함
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

    // 헬스장 사진 URL 추가
    const gymsWithPhotos = data.results.map((gym) => {
      const photoReference =
        gym.photos && gym.photos[0] && gym.photos[0].photo_reference;
      const photoUrl = photoReference
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`
        : null;

      return {
        ...gym,
        photoUrl, // 사진 URL 추가
      };
    });

    res.json(gymsWithPhotos);
  } catch (error) {
    console.error('Error fetching gyms:', error);
    res.status(500).send('Error fetching gyms');
  }
};
