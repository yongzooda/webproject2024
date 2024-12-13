고급웹프로그래밍 기말 프로젝트- Restful API를 이용한 웹 페이지 만들기

웹사이트 이름: fitconnect (올인원 헬스 플랫폼) 

사이트 접속 주소: https://webproject2024-fitconnect.fly.dev/

<사이트 가이드> 

1. 로그인 화면 
   
   ![image](https://github.com/user-attachments/assets/1b0c7461-e15b-4fdc-8077-bdaabd1c5d05)

   맨처음 fitconnect 웹사이트를 접속하면 로그인 페이지가 뜬다. 등록한 계정이 있다면 바로 이메일과 패스워드를 치고 접속하면 된다.
   사이트 평가과정에선 등록과정 없이 바로 로그인을 하여 사이트를 볼 수 있게 이메일: web@test.com 비번:2024로 셋팅 해놨다. 

3. 계정 등록 화면
   
   ![image](https://github.com/user-attachments/assets/afdb3910-7e56-4c6a-84f5-0d4628c0b2b6)

    사진에 나와 있는데로 정보를 등록하면서 회원가입을 하면 된다. 대신 이메일은 다른사람과 중복이 안된다.
  
4. 홈페이지 화면 및 상단 네비게이션바 설명

   ![image](https://github.com/user-attachments/assets/129d4f37-e312-422b-a0d6-b67235512035)

    로그인에 성공하면 제일 먼저 홈페이지 화면이 뜬다. 홈페이지엔 5가지 웹사이트 핵심 페이지로 바로 갈 수 있는 버튼들이 나열되어 있다.
   상단 네비게이션 바는 현재 페이지 정보를 띄워주고 로그인/로그아웃 버튼, 이전 페이지로 이동할 수 있는 버튼 이 포함되어 있다.
   그리고 fitconnect 로고 버튼을 누르면 어느 페이지에 있는 바로 홈페이지로 이동할 수 있다. (단 로그인한 상태에서만 가능)
   
5. 근처 헬스장 검색 페이지
   
   ![image](https://github.com/user-attachments/assets/c8d44cb1-148e-4354-a9bb-f34ae27e2079)

    페이지 접속 시 바로 현재 접속한 사용자의 위치를 오른쪽 지도화면에 찍어주고 주변 헬스장들을 마크로 찍어준다.
   마크를 클릭시 헬스장 정보(헬스장 이름, 평점, 위치, 대표사진, 현재 위치 기반 떨어진 거리)가 info window로 뜬다.
   그리고 왼쪽 화면엔 평점이 높고 거리가 가까운 헬스장 위주로 내림차순으로 헬스장 목록을 카드 형태로 나열한다.
   카드 목록 중 하나를 누르면 바로 지도에 찍힌 해당 헬스장의 마크로 이동하고 info window를 띄워준다.
   
6. 운동일지 페이지

![image](https://github.com/user-attachments/assets/c9fdfd29-d9b2-4e43-8125-4354c0e37a77)

페이지에 접속하면 여러 회원들이 쓴 운동일지들이 뜬다. 스크롤바를 내리면서 운동일지들을 확인하면 된다. 
본인이 쓴 운동일지는 edit 버튼(누르면 운동일지 수정 페이지로 넘어감)을 통해 수정할 수 있고 delete 버튼을 통해 삭제할 수 있다. 
또한 여러 사람들이 쓴 운동일지에 댓글을 달 수 가 있다.
add a comment 창에 댓글을 입력하고 add 버튼을 누르면 댓글이 화면에 바로 추가 된다. 댓글을 수정하거나 삭제하고 싶을 땐 본인이 쓴것만 가능하다. 
하지만 관리자 권한을 가지고 있는 계정은 모든 일지. 댓글에 대한 수정, 삭제가 가능하다. 
 
7. 운동일지 작성 페이지

![image](https://github.com/user-attachments/assets/7f49ef8a-b93d-4668-ac4f-f4c17d121061)

운동일지 페이지 상단 오른쪽에 add new workout log 버튼을 누르면 새로운 운동일지를 작성할 수 있는 페이지로 넘어간다.
운동 일지 작성자의 이름(Name), 일지 제목(Title), 기록할 운동의 종류(Exercise)( ex) 가슴운동, 등운동, 하체운동 등 자유롭게 작성), 
진행시간(Duration (minutes)), 운동한 날짜(Date), 운동 설명(Description), 운동 이미지 업로드 등의 항목을 작성하여 Add Workout Log 버튼을 누르면
새로운 운동일지가 전체에 추가된다.
   
8. 운동일지 수정 페이지

![image](https://github.com/user-attachments/assets/028b76e1-4e9f-419f-b046-d1422e069049)

운동일지 하단에 edit 버튼을 누르면 운동일지를 를 수정할 수 있는 페이지로 넘어간다. 대신 본인이 작성한 것만 가능하고 관리자는 예외적으로 다 가능하다. 
  
9. 식단일지 페이지

![image](https://github.com/user-attachments/assets/a6b7703a-3373-49b2-88c8-f6c4dac10976)

    페이지에 접속하면 여러 회원들이 쓴 식단일지들이 뜬다. 스크롤바를 내리면서 식단일지들을 확인하면 된다. 
   본인이 쓴 식단일지는 edit 버튼(누르면 식단일지 수정 페이지로 넘어감)을 통해 수정할 수 있고 delete 버튼을 통해 삭제할 수 있다. 
   또한 여러 사람들이 쓴 식단일지에 댓글을 달 수 가 있다.
   add a comment 창에 댓글을 입력하고 add 버튼을 누르면 댓글이 화면에 바로 추가 된다. 댓글을 수정하거나 삭제하고 싶을 땐 본인이 쓴것만 가능하다. 
   하지만 관리자 권한을 가지고 있는 계정은 모든 일지. 댓글에 대한 수정, 삭제가 가능하다.
 
10. 식단일지 작성 페이지

![image](https://github.com/user-attachments/assets/d2810650-807a-40d6-a7c2-f14b29567974)

    식단일지 페이지 상단 오른쪽에 add new workout log 버튼을 누르면 새로운 식단일지를 작성할 수 있는 페이지로 넘어간다.
   식단 일지 작성자의 이름(Name), 식단 이름(Food Name), 식단의 총 칼로리(Calories), 
   식단의 영양성분(Nutrition) - 탄수화물, 단백질, 지방, 당, 나트륨 함량 기록, 섭취 날짜 시간(Meal Time), 식단 설명(Description),
   식단 이미지 업로드 등의 항목을 작성하여 Add diet Log 버튼을 누르면 새로운 식단일지가 전체에 추가된다.
   
11. 식단일지 수정 페이지

![image](https://github.com/user-attachments/assets/7e362107-8dd3-42d9-82ec-4d9e037e96f3)

식단일지 하단에 edit 버튼을 누르면 식단일지를 수정할 수 있는 페이지로 넘어간다. 대신 본인이 작성한 것만 가능하고 관리자는 예외적으로 다 가능하다. 
   
12. 챌린지 페이지

![image](https://github.com/user-attachments/assets/e449d7f2-0bb3-418d-937b-1e8207675885)

페이지를 접속하면 Monthly Challenges라고 해당월에 설정한 목표치를 얼마나 채웠는지 시작적으로 당성률을 알려주는 차트가 표시된다. 
왼쪽에 Choose Month를 클릭해서 월별 목표 달성률을 볼 수 있다. 사용자가 지금까지 작성한 운동일지, 식단일지를 바탕으로 진행율을 계산하여 보여준다. 
운동일지나 식단 일지에 세부적으로 얼마나 운동을 하고 몇회를 했고 섭취한 영양성분 함량은 어떤지 세부적으로 기록 했기에 이 데이터를 기반으로 자동으로 분석해준다.
오른쪽의 Set Goals 버튼을 누르면 월별 목표 설정 페이지로 넘어가고 Go to Group Challenges 버튼을 누르면 그룹 챌린지 페이지로 넘어간다
    
13. 월별 목표 설정 페이지

![image](https://github.com/user-attachments/assets/7a63395f-21b9-4dae-a5bd-eed3508dd7f0)

먼저 목표를 설정할 달을 선택한다. 그리고 목표로 설정한 해당 달에 운동을 총 몇번을 갈꺼고 운동 시간은 총 몇 분을 해당 달에 채울 것인지 설정할 수 있다.
또한 해당 달에 채울 총 단백질, 탄수화물, 지방, 당을 세부적으로 설정할 수 있다. 이렇게 설정을 하면 챌린지 페이지에서 Monthly Challenges 달성률을 보여줄때 기준이 된다.
    
14. 그룹 챌린지 페이지

![image](https://github.com/user-attachments/assets/7448e927-5f31-48ef-8bca-85a74446ea79)

그룹 챌랜지 페이지로 가면 월별로 회원의 전체 랭킹을 보여준다. 랭킹 종류는 총 3가지가 있다. 먼저 성실성 랭킹은 회원이 작성한 운동 일지 개수와 식단 일지 개수의 합하여 전체에서 몇등인지 알려준다.
그리고 노력 랭킹 (운동시간)은 운동 일지에 기록된 총 운동 시간을 기준으로 합산해 등수를 알려준다. 또한 식단 점수 랭킹은 회원이 작성한 식단일지의 영양성분표에 기록된 것을 바탕으로 
단백질 1g당 +10점, 지방 1g당 -5점, 당 1g당-10점으로 계산하여 총점수를 산출해준다. 페이지 왼쪽에 있는 Choose Month를 클릭해서 다른 달의 랭킹 또한 볼 수 있다. 

15. 실시간 관리자와 상담채팅 페이지

![image](https://github.com/user-attachments/assets/2087a5f0-eb41-4dc1-b888-3522b3734e50)


    일반 회원 계정으로 실시간 채팅 페이지로 들어가면 바로 관리자와 채팅을 할 수 있는 채팅창이 나온다. 여기서 관리자에게 운동, 식단 관련 질문들을 자유롭게 할 수 있다.
    사진에서 보이는 것 처럼 전에 상담을 진행한 다른 관리자들과의 채팅기록도 그대로 들어가 있는 것을 볼 수 있다. 이렇게 여러명의 관리자가 여러 회원과 피드백을 주고 받을 수 있다.   

![image](https://github.com/user-attachments/assets/9e1d7c85-9ccf-420c-b519-ea5e42ed4af5)

    관리자 계정으로 실시간 채팅 페이지로 들어가면 일단 여러 회원들과 진행중인 채팅방 목록이 뜬다. 관리자 권한을 가진 계정들을 이 여러 채팅방 목록중에 하나에 접속하여 회원들에게 피드백을 줄 수 있다.
    현재 채팅방이 2개 이지만 가입자(일반 회원)가 새로 계속 늘어 상담이 많아 진다면 채팅방 목록을 여러개 볼 수 있게 될 것이다. 

![image](https://github.com/user-attachments/assets/2d5d5a91-3f1e-4355-a3b7-8ae38a868b6a)


    여러 회원들이 동시에 많은 채팅을 보낼 경우를 대비해 관리자 계정을 많이 만들어서 방마다 관리자를 배치하여 대화를 주고 받을 수 있다. 

17. 마이페이지

    ![image](https://github.com/user-attachments/assets/1600ce5e-7e72-4580-a2f6-0d16407f19b8)

   홈페이지 오른쪽 상단에 마이페이지 버튼이 있는데 누르면 지금까지 사용자가 작성한 운동, 식단 일지들 (거기에 달린 댓글까지)을 한번에 모아서 볼 수 있다. 
   또한 작성한 수정, 삭제도 바로 마이페이지 내에서 가능하다.  그리고 기존의 비밀번호를 다른 것으로 바꿀 수 있다. 변경시 바뀌었다고 바로 페이지에 뜬다


   
