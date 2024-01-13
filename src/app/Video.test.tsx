'use client'
import {useState, useEffect, useRef} from 'react';
import styles from './page.module.css'



export default function Video() {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [offer, setOffer] = useState<RTCSessionDescriptionInit | null>(null);
    useEffect(() => {
        createRtcConnection()
            .then(pc => {
                
                console.log(`pc.localDescription`, pc.localDescription)
                // if (pc.localDescription) 
                //     localVideoRef.current!.srcObject = pc.localDescription;
                pc.ontrack = (e) => {
                    console.log('----===    localVideoRef ontrack', e)
                //     localVideoRef.current!.srcObject = e.streams[0];
                
                };
                // localVideoRef.current!.srcObject = pc.localDescription;

            })  
    }, [])
   

    return (
        <div  className={styles.videocontainer} >
            <div>
                <h2>Local Video</h2>
                <video ref={localVideoRef} autoPlay controls></video>
            </div>
            <div>
                <h2>Remote Video:</h2>
                <video ref={remoteVideoRef} autoPlay controls></video>
            </div>
            
              
            {offer && <pre>{JSON.stringify(offer, null, 2)}</pre>}
        </div>
    )
}



function createRtcConnection(): Promise<RTCPeerConnection> {
    return navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((localStream) => {
        console.log("RTCPeerConnection init", localStream)
        const iceServers = [
          {
            urls: "stun:stun.l.google.com:19302",
            // urls: 'turn:138.68.169.35:3478?transport=tcp',
            // credential: 'bar',
            // username: 'foo2',
          },
        ]
        // const iceServers = [
        //   {
        //     urls: 'stun:stun.l.google.com:19302'
        //   }
        // ]
  
        var pc = new RTCPeerConnection({
          iceServers,
          'iceTransportPolicy': 'all',
          'bundlePolicy': 'balanced',
          'rtcpMuxPolicy': 'require',
          'iceCandidatePoolSize': 0,
        });
        localStream.getTracks().forEach((track) => {
            pc.addTrack(track, localStream);
        })
        return pc
      })
      .then((pc) => {
        console.log("create offer init")
        return pc.createOffer()
          .then(offerDescription => pc.setLocalDescription(offerDescription))
          .then(() => pc)
      })
      .then((pc) => {
        console.log("onicegatheringstatechange init")
        return new Promise((resolve, reject) => {
          pc.onicegatheringstatechange = () => {
            console.log("onicegatheringstatechange ", pc.iceGatheringState);
            if (pc.iceGatheringState === 'complete') {
              resolve(pc)
            }
          }
        })
      })
  }