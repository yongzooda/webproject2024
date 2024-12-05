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

exports.addFavoriteGym = async (req, res) => {
  console.log('addFavoriteGym 라우트에 요청이 도달했습니다');

  console.log('Request body:', req.body); // 요청 데이터 확인
  const { name, address, phoneNumber, rating, photoUrl, distance } = req.body;

  if (!req.user) {
    console.error('User not authenticated');
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      console.error('User not found');
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 찜한 헬스장이 이미 존재하는지 확인
    const isAlreadyFavorited = user.favoriteGyms.some(
      (gym) => gym.name === name && gym.address === address
    );

    if (isAlreadyFavorited) {
      console.error('Gym already favorited:', name);
      return res.status(400).json({ message: '이미 찜한 헬스장입니다.' });
    }

    user.favoriteGyms.push({
      name,
      address,
      phoneNumber,
      rating,
      photoUrl,
      distance,
    });
    await user.save();

    console.log('Favorite gym added:', { name, address });
    res.status(200).json({ message: '헬스장이 찜 목록에 추가되었습니다.' });
  } catch (error) {
    console.error('찜 목록 추가 중 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
