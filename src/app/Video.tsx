'use client'
import {useState, useEffect, useRef} from 'react';
import styles from './page.module.css'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


export default function Video() {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [offer, setOffer] = useState<RTCSessionDescriptionInit | null>(null);
    // const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    // const [videoPlaying, setVideoPlaying] = useState(true);
    // const [muted, setMuted] = useState(false);
    function startPeerConnections(stream:MediaStream) {

        const localPeerConnection = new RTCPeerConnection();
        const remotePeerConnection = new RTCPeerConnection();
        localVideoRef.current!.srcObject = stream;
        
        console.log(`stream`, stream);
        
        stream.getTracks().forEach(track => {
            console.log(`tadd rack`, track);
            localPeerConnection.addTrack(track, stream)
        });

        remotePeerConnection.ontrack = function (e) {
            remoteVideoRef.current!.srcObject = e.streams[0];
        };

        // remotePeerConnection.onnegotiationneeded = e => {
        //     if (remotePeerConnection.signalingState != "stable") return;
            
        // }
        

        remotePeerConnection.onicecandidate = e => {
            console.log('remotePeerConnection onicecandidate', e );
            !e.candidate
                || localPeerConnection.addIceCandidate(e.candidate)
                .catch(e => {
                    console.error(e)
                });
        }

        localPeerConnection.onicecandidate = e => {
            console.log('localPeerConnection onicecandidate', e );
            !e.candidate
                || remotePeerConnection.addIceCandidate(e.candidate)
                .catch(e => {
                    console.error(e)
                });
        }

        localPeerConnection.createOffer()
            .then(offer => {
                console.log(`2---- offer, `, offer)
                if(offer) {
                    localPeerConnection.setLocalDescription(offer)
                }
                return offer
                // setOffer(offer)
            })
            .then((offer) => {
                remotePeerConnection.setRemoteDescription(offer)
                // localPeerConnection.localDescription && remotePeerConnection.setRemoteDescription(localPeerConnection.localDescription)
            })
            .then(() => {
                return remotePeerConnection.createAnswer()
            })
            .then(answer => remotePeerConnection.setLocalDescription(answer))
            .then(() => {
                console.log('222  YOLLOOOOOOO')
                console.log('remotePeerConnection.localDescription', remotePeerConnection.localDescription)
                remotePeerConnection.localDescription && localPeerConnection.setRemoteDescription(remotePeerConnection.localDescription)
            })
            // .then(() => {
            //     localPeerConnection.onicecandidate = (e) => {
            //         if (e.candidate) {
            //             console.log('localPeerConnection onicecandidate', e.candidate)
            //             remotePeerConnection.addIceCandidate(e.candidate)
            //                 .catch(e => {
            //                     console.error(e)
            //                 });
            //         }
            //     }
            // })
            .catch(e => {
                console.error(e)
            });
    }
    console.log('VIDEO' )

    useEffect(() => {
        console.log('VIDEO use effect')
        
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                startPeerConnections(stream);
                // setMediaStream(stream);
                
            });
        
            

    }, []);

   

    return (
        <div  className={styles.videocontainer} >
            <div>
                <h2>Local Video</h2>
                <video height="320" ref={localVideoRef} autoPlay controls></video>
            </div>
            <div>
                <h2>Remote Video:</h2>
                <video height="320" ref={remoteVideoRef} autoPlay controls></video>
            </div>
            
              
            {offer && <pre>{JSON.stringify(offer, null, 2)}</pre>}
        </div>
    )
}