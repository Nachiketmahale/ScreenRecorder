//btns
const Startbtn=$('#capture');
const Stopbtn=$('#stop');
const recordedVideo=document.getElementById('recordedvideo');
const DownloadBtn=document.getElementById('downloadBtn');
let stream,Audio,recordstream,mixedStream=null;
let HasCheckedAudio;
let chunks=[];

const getoptions=()=>{
    const options={
        video:{
            cursor:"always"
        },
        audio: false,
    };
    return options;
}

const SourceProviderToVideoElement=(stream)=>{
    document.getElementById('videotorecord').srcObject=stream;
    document.getElementById('videotorecord').play();
    RecordVideoElement(stream,Audio);
}

const RecordVideoElement=(stream,Audio)=>{
    if(HasCheckedAudio){
        mixedStream=new MediaStream([...stream.getTracks(),...Audio.getTracks()]);
    }
    else{
        mixedStream=new MediaStream([...stream.getTracks()]);
    }
    recordstream=new MediaRecorder(mixedStream);
    recordstream.ondataavailable=datahandling;
    recordstream.onstop=handlestopevent;
    recordstream.start(1000);
}

const IsAudioChecked=()=>{
    if($('#audio').is(':checked')){
        console.log('audio checked');
        HasCheckedAudio=true;
        return true;
    }
    console.log('audio unchecked');
    return false;
}

const handlestopevent=(e)=>{
    const blob=new Blob(chunks,{'type':'video/mp4'});
    chunks=[];
    DownloadBtn.href=URL.createObjectURL(blob);
    DownloadBtn.download='video.mp4';
    DownloadBtn.disabled=false;

    recordedVideo.src=URL.createObjectURL(blob);
    recordedVideo.load();
    recordedVideo.onloadeddata=function(){
        recordedVideo.play();
    }
    stream.getTracks().forEach((track) => track.stop());
	Audio.getTracks().forEach((track) => track.stop());
}

const datahandling=(e)=>{
    chunks.push(e.data);
}

//Start capturing
Startbtn.click(async ()=>{
    //get source
    const {video}=getoptions();
    try{
        stream=await navigator.mediaDevices.getDisplayMedia({
            video
        });
        if(IsAudioChecked()){
            Audio=await navigator.mediaDevices.getUserMedia({
                audio:{
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            })
        }
    }
    catch(err){
        console.log("Erro"+err);
        alert('We are unable to access your display video');
    }
    Stopbtn.prop('disabled',false);
    Startbtn.prop('disabled',true);
    $('#audio').prop('disabled',true);
    $('#recordedsection').hide();
    //providing source
     SourceProviderToVideoElement(stream)
    //recording stream function is executed SPTVE function;
})

//Stop capturing
Stopbtn.click(()=>{
    recordstream.stop();
    Stopbtn.prop('disabled',true);
    Startbtn.prop('disabled',false);
    $('#recordedsection').show();
})

function Main(){
    Stopbtn.prop('disabled',true);
    Startbtn.prop('disabled',false);
    $('#recordedsection').hide();
}

Main()