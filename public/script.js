const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined)
let myVideoStream;

let user = sessionStorage.getItem('username');
if (user === null) {
    user = prompt("Please Enter your name");
}

if (user != null) {
    //storing username in session storage so that the prompt doesn't appear everytime when we reload the page
    sessionStorage.setItem('username', user);
}
//variable to toggle chat in and out of the meeting display
//it is marked true because it will be displayed initially
let isChatVisible = true;
//html element to display the video of the meeting host
const myVideo = document.createElement('video')
myVideo.muted = true; //by default the host will be muted when he/she enters the meeting
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
  //adding a new user to the stream, making him join the meeting
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
// when the user disconnects from the stream
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id, user)
})
// function invoked to connect a new user in our stream
function joinNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    //to remove the video of the user whenever he/she disconnects from the meeting or leaves the meeting
    video.remove()
  })

  peers[userId] = call
}
// function made to add video to the meeting of the user
function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  //append the video in the display of meeting
  videoGrid.append(video)
}


// for scrolling in the chat box
const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}

// helps in adding the functionality of muting and unmuting the user
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    //unmute the user
    unMuteUser();
  } else {
    //mute the user
    muteUser();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}
// helps in adding the functionality of stopping the video 
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
// function called when person leaves the meeting
const leaveMeeting = () =>{
  location.replace("/")
}
// for toggling the chat
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
