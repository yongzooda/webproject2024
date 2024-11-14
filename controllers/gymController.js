// controllers/gymController.js

exports.getNearbyGyms = async (req, res) => {
  const { lat, lng } = req.query;
  const apiKey = 'AIzaSyCR_YT9dN3ei0ZBsiui-9UX8Vj6POVYEHQ'; // Google Places API 키를 입력하세요
  const radius = 5000; // 검색 반경 (단위: 미터)

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${encodeURIComponent(
    lat
  )},${encodeURIComponent(lng)}&radius=${radius}&type=gym&key=${apiKey}`;

  try {
    const { default: fetch } = await import('node-fetch'); // 동적 import() 사용
    const response = await fetch(url);
    const data = await response.json();
    console.log(data.results); // 데이터 내용 확인
    console.log('Status:', data.status); // 응답 상태 코드 확인
    res.json(data.results); // 헬스장 목록을 JSON 형식으로 반환
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching gyms');
  }
};
