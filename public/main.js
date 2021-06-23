let roomId;
let peer;
const videos = document.querySelector('#videos');
const otherUserVideo = document.createElement("video");
otherUserVideo.setAttribute("playsinline", true);

const socket = io('/')

const config = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"]
    }
  ]
};

socket.on('connect', ()=>{
  socket.on('joined', ()=>{
    document.querySelector("#controls").innerHTML += "<br><br><button onclick='startCall()'>Start Call</button>"
  });
  
  socket.on('rtcOffer', async (sdp)=>{
    peer = new RTCPeerConnection(config);
    peer.setRemoteDescription(new RTCSessionDescription(sdp));
    peer.onicecandidate = sendCandidate;
    peer.ontrack = (event)=>{
      otherUserVideo.srcObject = event.streams[0];
      otherUserVideo.onloadedmetadata = ()=> otherUserVideo.play();
    }
    const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
    const vdo = document.createElement("video");
    vdo.muted = true;
    vdo.setAttribute("playsinline", true);
    vdo.srcObject = stream;
    vdo.onloadedmetadata = ()=>vdo.play();
    videos.appendChild(vdo)
    videos.appendChild(otherUserVideo)

    
    
    
    peer.createAnswer().then((answer)=>{
    peer.setLocalDescription(answer);

    socket.emit("rtcAnswer", {roomId, sdp: answer})
    
  })
   
  });
  socket.on('rtcAnswer', sdp=>{
    peer.setRemoteDescription(new RTCSessionDescription(sdp))
  });


  socket.on('icecandidate', e=>{
    peer.addIceCandidate(new RTCIceCandidate({
      sdpMLineIndex: e.label,
      candidate: e.candidate
    }));
  });
});

const joinRoom = ()=>{
  roomId = document.querySelector('#roomId').value;
  socket.emit("join", roomId);
}

const sendCandidate = (e)=>{
  if(e.candidate){
    socket.emit("icecandidate", {
      roomId, 
      label: e.candidate.sdpMLineIndex,
      candidate: e.candidate.candidate
    })

  }
}

const startCall = ()=>{
  navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(stream=>{
    const vdo = document.createElement("video");
    vdo.muted = true;
    vdo.setAttribute("playsinline", true);
    vdo.srcObject = stream;
    vdo.onloadedmetadata = ()=>vdo.play();
    videos.appendChild(vdo)
    videos.appendChild(otherUserVideo)
    peer = new RTCPeerConnection(config);
    peer.onicecandidate = sendCandidate;
    peer.ontrack = e=>{
      otherUserVideo.srcObject = event.streams[0];
      otherUserVideo.onloadedmetadata = ()=> otherUserVideo.play();
    }
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
    // const dc = peer.createDataChannel("animesh");
    // dc.onopen = ()=>console.log("Connected")
    
    peer.createOffer().then(offer=>{
      peer.setLocalDescription(offer);
      socket.emit('rtcOffer',{
        roomId,
        sdp: offer
      });
    })
  })
  
}