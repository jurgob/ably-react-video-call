'use client'
import {useState, useEffect, useRef} from 'react';
import styles from './page.module.css'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));


export default function Video() {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [offer, setOffer] = useState<RTCSessionDescriptionInit | null>(null);
    const [answer, setAnswer] = useState<RTCSessionDescriptionInit | null>(null);
    const [localPeerConnection, setLocalPeerConnection] = useState<RTCPeerConnection>(new RTCPeerConnection());
    const [remotePeerConnection, setRemotePeerConnection] = useState<RTCPeerConnection>(new RTCPeerConnection());
    
    function startPeerConnections(stream:MediaStream) {
        setLocalPeerConnection(new RTCPeerConnection());
        setRemotePeerConnection(new RTCPeerConnection());

        localVideoRef.current!.srcObject = stream;
                
        stream.getTracks().forEach(track => {
            localPeerConnection.addTrack(track, stream)
        });

        remotePeerConnection.ontrack = function (e) {
            remoteVideoRef.current!.srcObject = e.streams[0];
        };

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
                setOffer(offer)
                if(offer) {
                    localPeerConnection.setLocalDescription(offer)
                }
                return offer
                // setOffer(offer)
            })
            .then((offer) => {
                remotePeerConnection.setRemoteDescription(offer)
            })
            .then(() => {
                return remotePeerConnection.createAnswer()
            })
            .then(answer => {
                setAnswer(answer)
                return remotePeerConnection.setLocalDescription(answer)
            })
            .then(() => {
                remotePeerConnection.localDescription && localPeerConnection.setRemoteDescription(remotePeerConnection.localDescription)
            })
            .catch(e => {
                console.error(e)
            });
    }

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
                startPeerConnections(stream);                
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
            <div>
                {offer && <pre>{JSON.stringify(offer, null, 2)}</pre>}

                {answer && <pre>{JSON.stringify(answer, null, 2)}</pre>}
            </div>
              
            
        </div>
    )
}