const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined)
let myVideoStream;
let user = sessionStorage.getItem('username');
if (user === null) {
    user = prompt("Please Enter your name");
}

if (user != null) {
      
    sessionStorage.setItem('username', user);
}
let isChatVisible = true;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    joinNewUser(userId, stream)
  })
  // input value
  let text = $("input");
  // when press enter send message
  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val());
      text.val('')
    }
  });
  socket.on("createMessage", (message, username) => {
    $("ul").append(`<li class="message"><b>${username===user?"You":username}</b><br/>${message}</li>`);
    scrollToBottom()
  })
 
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id, user)
})

function joinNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}



const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    unMuteUser();
  } else {
    muteUser();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    playUserVideo()
  } else {
    stopUserVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const muteUser = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const unMuteUser = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const stopUserVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const playUserVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const leaveMeeting = () =>{
  location.replace("/")
}

const toggleChat = () =>{
  
  var right_box = document.getElementsByClassName("screen_right");
  var left_box = document.getElementsByClassName("screen_left");
  if(isChatVisible){
    left_box[0].style.flex = "1";
    right_box[0].style.display = "none";
    right_box[0].style.transition = "display 0.3s";
    left_box[0].style.transition = "flex 0.3s";
  }
  else{
   
    left_box[0].style.flex = "0.8";
    right_box[0].style.display = "flex";
    right_box[0].style.transition = "display 0.3s";
    left_box[0].style.transition = "flex 0.3s";    
  }
  isChatVisible = !isChatVisible;
 
}
