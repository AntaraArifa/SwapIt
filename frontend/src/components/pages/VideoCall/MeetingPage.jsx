import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import React, { useState } from "react";
import { useParams } from "react-router-dom";

export const MeetingPage = () => {
    const {roomCode}=useParams();
   
    
    const myMeeting=async(element)=>{
        const appID=1181749484;
        const serverSecret="f5f96db6eb4bcf7bddd5498ce0cb457b";
        const kitToken=ZegoUIKitPrebuilt.generateKitTokenForTest(appID,serverSecret,roomCode,Date.now().toString(),"Admin");
        const zc=ZegoUIKitPrebuilt.create(kitToken);
        zc.joinRoom({
            container:element,
            sharedLinks:[
                {
                    name:"Copy Link",
                    url:`http://localhost:5173/meeting/${roomCode}`
                }
            ],
            scenario:{
                mode:ZegoUIKitPrebuilt.OneONoneCall,
            },
            showScreenSharingButton:true,
        })
      }
    return(
        <div>
            <div ref={myMeeting}/>
            
        </div>
    )
};