const videocontainer=document.getElementById('videocontainer');
const recordedvideo=document.getElementById('recordedvideo');
const startBtn=document.getElementById('start-recording');
const stopBtn=document.getElementById('stop-recording');
const downloadBtn=document.getElementById('downloadBtn');
const downloadsection=document.getElementById('downloadsection');
let audio,stream,recordstream,mixedStream=null;
let chunks=[];

const showvideo=()=>{
    if(stream){
        videocontainer.srcObject=stream;
        videocontainer.play();
    }
    else{
        alert('We are unable to access your display video');
    }
}

const getneededthings= async () =>{
    try{
        stream=await navigator.mediaDevices.getDisplayMedia({
            video:{
                curson:"always"
            }
        })

        audio=await navigator.mediaDevices.getUserMedia({
            audio:{
                echoCancellation: true,
				noiseSuppression: true,
				sampleRate: 44100,
            }
        })
        showvideo();
    }catch(err){
        console.log("Error"+error);
    }
}

const stopBtnhandler=()=>{
    recordstream.stop();
    startBtn.disabled=false;
    stopBtn.disabled=true;
}

const handlestopevent=(e)=>{
    const blob=new Blob(chunks,{'type':'video/mp4'});
    chunks=[];
    downloadBtn.href=URL.createObjectURL(blob);
    downloadBtn.download='video.mp4';
    downloadBtn.disabled=false;

    recordedvideo.src=URL.createObjectURL(blob);
    recordedvideo.load();
    recordedvideo.onloadeddata=function(){
        recordedvideo.play();
    }
    stream.getTracks().forEach((track) => track.stop());
	audio.getTracks().forEach((track) => track.stop());
}

const datahandling=(e)=>{
    chunks.push(e.data);
}

const startBtnhandler=()=>{
    startBtn.disabled=true;
    stopBtn.disabled=false;
    getneededthings()
    .then(()=>{
        if(stream && audio){
            mixedStream=new MediaStream([...stream.getTracks(), ...audio.getTracks()]);
            recordstream=new MediaRecorder(mixedStream);
            recordstream.ondataavailable=datahandling;
            recordstream.onstop=handlestopevent;
            recordstream.start(1000);
        }
        else{
            console.warn('no stream available');
        }
    })
}

startBtn.addEventListener('click',()=>{
    startBtnhandler();
})

stopBtn.addEventListener('click',()=>{
    downloadsection.classList.remove('hide');
    stopBtnhandler();
})