var socket = io(); // socket.io 객체 생성

// 서버에서 이벤트가 왔을 때 실행할 콜백 함수 설정
socket.on('event', function (data) {
  var msg
  
  switch (data.EvtType) { // 이벤트 타입을 판별하여 메시지 생성
  case 'message':
    msg = data.User + ': ' + data.Text;
    break;
  case 'join':
    msg = data.User + '님이 입장했습니다.';
    break;
  case 'leave':
    msg = data.User + '님이 퇴장했습니다.';
    break;
  }

  // <div> 태그를 생성하여 채팅 메시지를 넣어줌
  col = $('<div>').addClass('col-md-12').text(msg)
  row = $('<div>').addClass('row').append(col)
  list = $('#messageList').append(row)
  
  if (list.children().size() > 15)   // 채팅 메시지가 15개를 넘어가면
    list.find('div:first').remove(); // 메시지 삭제
});

// 채팅 메시지를 서버에 보내는 함수
send = function () {
  msg = $('#message').val()      // 입력 상자에서 메시지를 가져옴
  if (msg != '') {               // 메시지가 있으면
    socket.emit('message', msg); // 서버에 메시지를 보냄
    $('#message').val('');       // 입력한 데이터 삭제
  }
}

// 보내기 버튼으로 메시지를 보냄
$('#send').click(function () {
  send()
});

// 엔터 키 입력으로 메시지를 보냄
$('#message').keyup(function(e) {
    if (e.keyCode == 13) { // 13이면 엔터 키
      send()
    }
});